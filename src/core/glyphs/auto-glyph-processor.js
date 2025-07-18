import { DC } from "../constants";

export const AutoGlyphProcessor = {
  get scoreMode() {
    return player.reality.glyphs.filter.select;
  },
  set scoreMode(value) {
    player.reality.glyphs.filter.select = value;
  },
  get sacMode() {
    return player.reality.glyphs.filter.trash;
  },
  set sacMode(value) {
    player.reality.glyphs.filter.trash = value;
  },
  get types() {
    return player.reality.glyphs.filter.types;
  },
  // This exists only to make a couple code sections cleaner.
  bitmaskIndexOffset(type) {
    switch (type) {
      case "time": {
        return 0;
      }
      case "dilation": {
        return 4;
      }
      case "replication": {
        return 8;
      }
      case "infinity": {
        return 12;
      }
      case "power": {
        return 16;
      }
      case "effarig": {
        return 20;
      }
      default: {
        throw new Error("Unknown glyph type mode in bitmaskIndexOffset");
      }
    }
  },
  // This function is meant to be something which assigns a value to every glyph, with the assumption that
  // higher numbers correspond to better glyphs. This value is also displayed on tooltips when it depends
  // on only the glyph itself and not external factors.
  filterValue(glyph) {
    const typeCfg = this.types[glyph.type];
    if (["companion", "reality"].includes(glyph.type)) {
      return new Decimal(Infinity);
    }
    if (glyph.type === "cursed") {
      return new Decimal(-Infinity);
    }
    switch (this.scoreMode) {
      case AUTO_GLYPH_SCORE.LOWEST_SACRIFICE: {
        return player.reality.glyphs.sac[glyph.type].gte(
          GlyphInfo[glyph.type].sacrificeInfo.cap,
        )
          ? new Decimal(-Infinity)
          : player.reality.glyphs.sac[glyph.type].mul(-1);
      }
      case AUTO_GLYPH_SCORE.EFFECT_COUNT: {
        return strengthToRarity(glyph.strength).div(1e3).add(
          getGlyphEffectsFromArray(glyph.effects).length,
        );
      }
      case AUTO_GLYPH_SCORE.RARITY_THRESHOLD: {
        return strengthToRarity(glyph.strength);
      }
      case AUTO_GLYPH_SCORE.SPECIFIED_EFFECT: {
        // Value is equal to rarity but minus 200 for each missing effect. This makes all glyphs which don't
        // satisfy the requirements have a negative score and generally the worse a glyph misses the requirements,
        // the more negative of a score it will have
        const glyphEffectCount = glyph.effects.length;
        if (glyphEffectCount < typeCfg.effectCount) {
          return strengthToRarity(glyph.strength).sub(
            200 * (typeCfg.effectCount - glyphEffectCount),
          );
        }
        // The missing effect count can be gotten by taking the full filter bitmask, removing only the bits which are
        // present on both the filter and the glyph, and then counting the bits up
        const missingEffects = countValuesFromBitmask(
          typeCfg.specifiedMask - (typeCfg.specifiedMask & glyph.effects),
        );
        return strengthToRarity(glyph.strength).sub(200 * missingEffects);
      }
      case AUTO_GLYPH_SCORE.EFFECT_SCORE: {
        const effectList = getGlyphEffectsFromArray(glyph.effects, 0, 0);
        // This ternary check is required to filter out any effects which may appear on the glyph which aren't normally
        // there in typical glyph generation. Ra-Nameless 25 is the only case where this happens, but this also has the
        // side-effect of making altered glyph generation in mods less likely to crash the game as well
        const effectScore = effectList
          .map(e => (typeCfg.effectScores[e] ? typeCfg.effectScores[e] : 0))
          .sum();
        return strengthToRarity(glyph.strength).add(effectScore);
      }
      // Picked glyphs are never kept in Alchemy modes.
      // Glyphs for non-unlocked or capped Alchemy Resources are assigned NEGATIVE_INFINITY
      // to make them picked last, because we can't refine them.
      case AUTO_GLYPH_SCORE.LOWEST_ALCHEMY: {
        const resource = AlchemyResource[glyph.type];
        const refinementGain = GlyphSacrificeHandler.glyphRefinementGain(glyph);
        return resource.isUnlocked && refinementGain.gt(0)
          ? resource.amount.neg()
          : new Decimal(-Infinity);
      }
      case AUTO_GLYPH_SCORE.ALCHEMY_VALUE: {
        return AlchemyResource[glyph.type].isUnlocked
          ? GlyphSacrificeHandler.glyphRefinementGain(glyph)
          : new Decimal(-Infinity);
      }
      default: {
        throw new Error("Unknown glyph score mode in score assignment");
      }
    }
  },
  // This is a mode-specific threshold which determines if selected glyphs are "good enough" to keep
  thresholdValue(glyph) {
    // Glyph filter settings are undefined for companion/cursed/reality glyphs, so we return the lowest possible
    // value on the basis that we never want to automatically get rid of them
    if (this.types[glyph.type] === undefined) {
      return DC.BEMAX.neg();
    }
    switch (this.scoreMode) {
      case AUTO_GLYPH_SCORE.EFFECT_COUNT: {
        return player.reality.glyphs.filter.simple;
      }
      case AUTO_GLYPH_SCORE.RARITY_THRESHOLD:
      case AUTO_GLYPH_SCORE.SPECIFIED_EFFECT: {
        return this.types[glyph.type].rarity;
      }
      case AUTO_GLYPH_SCORE.EFFECT_SCORE: {
        return this.types[glyph.type].score;
      }
      case AUTO_GLYPH_SCORE.LOWEST_SACRIFICE:
      case AUTO_GLYPH_SCORE.LOWEST_ALCHEMY:
      case AUTO_GLYPH_SCORE.ALCHEMY_VALUE: {
        return DC.BEMAX;
      }
      default: {
        throw new Error("Unknown glyph score mode in threshold check");
      }
    }
  },
  wouldKeep(glyph) {
    return this.filterValue(glyph).gte(this.thresholdValue(glyph));
  },
  // Given a list of glyphs, pick the one with the highest score
  pick(glyphs) {
    // We want to make sure to account for when glyphs are compared to different thresholds based on their type, or
    // else we end up always picking the rarest glyph despite all filter settings. However, we need to special-case
    // modes which never keep glyphs, or else they all become the same value and it ends up picking pseudo-randomly
    const glyphScore = (glyph) => {
      const filter = this.filterValue(glyph);
      const threshold = this.thresholdValue(glyph);
      return Decimal.gte(threshold, Number.MAX_VALUE)
        ? filter
        : Decimal.sub(filter, threshold);
    };

    return glyphs
      .map(g => ({ glyph: g, score: glyphScore(g) }))
      .reduce((x, y) => (x.score.gt(y.score) ? x : y))
      .glyph;
  },
  getRidOfGlyph(glyph) {
    // Auto clean calls this function too, which chokes without a special case for these types
    if (glyph.type === "cursed" || glyph.type === "companion") {
      GlyphSacrificeHandler.deleteGlyph(glyph, true);
      return;
    }

    switch (this.sacMode) {
      case AUTO_GLYPH_REJECT.SACRIFICE: {
        GlyphSacrificeHandler.sacrificeGlyph(glyph, true);
        break;
      }
      case AUTO_GLYPH_REJECT.REFINE: {
        GlyphSacrificeHandler.attemptRefineGlyph(glyph, true);
        break;
      }
      case AUTO_GLYPH_REJECT.REFINE_TO_CAP: {
        if (GlyphSacrificeHandler.glyphRefinementGain(glyph) === 0) {
          GlyphSacrificeHandler.sacrificeGlyph(glyph, true);
        } else {
          GlyphSacrificeHandler.attemptRefineGlyph(glyph, true);
        }
        break;
      }
      default: {
        throw new Error("Unknown auto Glyph Sacrifice mode");
      }
    }
  },
  // Generally only used for UI in order to notify the player that they might end up retroactively getting rid of
  // some glyphs they otherwise want to keep
  hasNegativeEffectScore() {
    return this.scoreMode === AUTO_GLYPH_SCORE.EFFECT_SCORE
      && Object.values(this.types).map(t => t.effectScores.min()).min() < 0;
  },

  // These are here because they're used in multiple UI components
  filterModeName(id) {
    switch (id) {
      case AUTO_GLYPH_SCORE.LOWEST_SACRIFICE: {
        return "Lowest Total Glyph Sacrifice";
      }
      case AUTO_GLYPH_SCORE.EFFECT_COUNT: {
        return "Number of Effects";
      }
      case AUTO_GLYPH_SCORE.RARITY_THRESHOLD: {
        return "Rarity Threshold";
      }
      case AUTO_GLYPH_SCORE.SPECIFIED_EFFECT: {
        return "Specified Effect";
      }
      case AUTO_GLYPH_SCORE.EFFECT_SCORE: {
        return "Effect Score";
      }
      case AUTO_GLYPH_SCORE.LOWEST_ALCHEMY: {
        return "Lowest Alchemy Resource";
      }
      case AUTO_GLYPH_SCORE.ALCHEMY_VALUE: {
        return "Refinement Value";
      }
      default: {
        return "Invalid Glyph filter mode";
      }
    }
  },
  trashModeDesc(id) {
    switch (id) {
      case AUTO_GLYPH_REJECT.SACRIFICE: {
        return "Always sacrifice";
      }
      case AUTO_GLYPH_REJECT.REFINE: {
        return "Always refine";
      }
      case AUTO_GLYPH_REJECT.REFINE_TO_CAP: {
        return "Refine to cap, then sacrifice";
      }
      default: {
        return "Invalid Glyph trash mode";
      }
    }
  },
};

export function autoAdjustGlyphWeights() {
  const sources = getGlyphLevelSources();
  const f = x =>
    Decimal.pow(Decimal.clampMin(1, Decimal.log10(x.mul(5))), 3 / 2);
  const totalWeight = Object.values(sources).map(s => f(s.value)).sum();
  const scaledWeight = key =>
    f(sources[key].value).div(totalWeight).mul(100).clampMax(100).toNumber();

  // Adjust all weights to be integer, while maintaining that they must sum to 100. We ensure it's within 1 on the
  // weights by flooring and then taking guesses on which ones would give the largest boost when adding the lost
  // amounts. This isn't necessarily the best integer weighting, but gives a result that's quite literally within
  // 99.97% of the non-integer optimal settings and prevents the total from exceeding 100.
  const weightKeys = ["ep", "repl", "dt", "eternities"];
  const weights = [];
  for (const key of weightKeys) {
    weights.push({
      key,
      percent: scaledWeight(key),
    });
  }
  const fracPart = x => x - Math.floor(x);
  const priority = weights.sort((a, b) =>
    fracPart(b.percent) - fracPart(a.percent),
  ).map(w => w.key);
  const missingPercent = 100
    - weights.map(w => Math.floor(w.percent)).reduce((a, b) => a + b);
  for (let i = 0; i < weightKeys.length; i++) {
    const key = priority[i];
    player.celestials.effarig.glyphWeights[key]
      = Math.floor(scaledWeight(key)) + (i < missingPercent ? 1 : 0);
  }
}

function getGlyphLevelSources() {
  // Glyph levels are the product of 3 or 4 sources (eternities are enabled via upgrade).
  // Once Effarig is unlocked, these contributions can be adjusted; the math is described in detail
  // in getGlyphLevelInputs. These *Base values are the nominal inputs, as they would be multiplied without Effarig
  let eternityPoints = Player.canEternity
    ? Currency.eternityPoints.value.plus(gainedEternityPoints())
    : Currency.eternityPoints.value;
  eternityPoints = Decimal.max(
    player.records.thisReality.maxEP,
    eternityPoints,
  );
  const epCoeff = 0.016;
  const epBase = Decimal.pow(Decimal.max(1, eternityPoints.add(1).log10()), 0.5)
    .mul(epCoeff);
  const replPow = getAdjustedGlyphEffect("replicationglyphlevel").add(0.4);
  const replCoeff = 0.025;
  const replBase = Decimal.pow(
    Decimal.max(1, player.records.thisReality.maxReplicanti.max(1).log10()),
    replPow,
  )
    .mul(replCoeff);
  const dtPow = Decimal.add(getAdjustedGlyphEffect("realityDTglyph"), 1.3);
  const dtCoeff = 0.025;
  const dtBase = Decimal.pow(
    Decimal.max(1, player.records.thisReality.maxDT.add(1).log10()),
    dtPow,
  ).mul(dtCoeff);
  const eterBase = Effects.max(new Decimal(1), RealityUpgrade(18));
  return {
    ep: {
      name: "EP",
      value: epBase,
      coeff: new Decimal(epCoeff),
      exp: new Decimal(0.5),
    },
    repl: {
      name: "Replicanti",
      value: replBase,
      coeff: new Decimal(replCoeff),
      exp: new Decimal(replPow),
    },
    dt: {
      name: "DT",
      value: dtBase,
      coeff: new Decimal(dtCoeff),
      exp: new Decimal(dtPow),
    },
    eternities: {
      name: "Eternities",
      value: eterBase,
      // These are copied from Reality Upgrade 18's gameDB entry
      coeff: new Decimal(0.45),
      exp: new Decimal(0.5),
    },
  };
}

export function getGlyphLevelInputs() {
  const sources = getGlyphLevelSources();
  const staticFactors = GameCache.staticGlyphWeights.value;
  // If the nomial blend of inputs is a * b * c * d, then the contribution can be tuend by
  // changing the exponents on the terms: aⁿ¹ * bⁿ² * cⁿ³ * dⁿ⁴
  // If n1..n4 just add up to 4, then the optimal strategy is to just max out the one over the
  // largest term -- so probably replicants, So, instead of using the weights directly, a
  // function of the weights is used: n_i = (4 w_i)^blendExp; put differently, the exponents
  // don't add up to 4, but their powers do (for blendExp = 1/3, the cubes of the exponents sum to
  // 4.
  // The optimal weights, given a blendExp, are proportional to log(x)^(1/(1- blendExp))
  const blendExp = 1 / 3;
  // Besides adding an exponent to a, b, c, and d, we can also scale them before exponentiation.
  // So, we'd have (s a)ⁿ¹ * (s b)ⁿ² * (s c)ⁿ³ * (s d)ⁿ⁴
  // Then, we can divide the result by s⁴; this does nothing for even weights
  // This can reduce the effect that Effarig can have; consider the following examples:
  // Inputs : 100, 1, 1, 1. Nominal result : 100
  // blendExp = 1/3; optimal weights: 1, 0, 0, 0; result = 1493
  // Scaling by 100: 10000, 100, 100, 100
  //                 optimal weights: 0.485, 0.17, 0.17, 0.17; result = 191.5
  // The degree of this effect depends on the scale of the inputs:
  // Inputs: 1000, 1, 1, 1. Nominal result: 1000
  //                 optimal weights: 1, 0, 0, 0; result = 57836
  // Scaling by 100: 100000, 100, 100, 100
  //                 optimal weights: 0.57, 0.14, 0.14, 0.14; result = 3675
  // Scaling does allow the user to produce results less than 1
  // 100000, 100, 100, 100 with weights of 0, 1, 0, 0 results in 1.49e-5
  // For display purposes, each term is divided independently by s.
  const preScale = 5;
  const weights = player.celestials.effarig.glyphWeights;
  const adjustFactor = (source, weight) => {
    const input = source.value;
    const powEffect = Decimal.pow(4 * weight, blendExp);
    source.value = input.gt(0)
      ? Decimal.pow(input.mul(preScale), powEffect).div(preScale)
      : new Decimal();
    source.coeff = Decimal.pow(preScale, powEffect.sub(1)).mul(
      Decimal.pow(source.coeff, powEffect),
    );
    source.exp = source.exp.mul(powEffect);
  };
  adjustFactor(sources.ep, weights.ep / 100);
  adjustFactor(sources.repl, weights.repl / 100);
  adjustFactor(sources.dt, weights.dt / 100);
  adjustFactor(sources.eternities, weights.eternities / 100);
  const shardFactor = Ra.unlocks.relicShardGlyphLevelBoost.effectOrDefault(
    new Decimal(),
  );
  let baseLevel = sources.ep.value.mul(sources.repl.value).mul(sources.dt.value)
    .mul(sources.eternities.value)
    .mul(staticFactors.perkShop).add(shardFactor);
  const singularityEffect = SingularityMilestone.glyphLevelFromSingularities
    .effectOrDefault(1);
  baseLevel = baseLevel.mul(singularityEffect);

  let scaledLevel = baseLevel;
  // The softcap starts at begin and rate determines how quickly level scales after the cap, turning a linear pre-cap
  // increase to a quadratic post-cap increase with twice the scaling. For example, with begin = 1000 and rate = 400:
  // - Scaled level 1400 requires +800 more base levels from the start of the cap (ie. level 1800)
  // - Scaled level 1800 requires +1600 more base levels from scaled 1400 (ie. level 3400)
  // - Each additional 400 scaled requires another +800 on top of the already-existing gap for base
  // This is applied twice in a stacking way, using regular instability first and then again with hyperinstability
  // if the newly reduced level is still above the second threshold
  const instabilitySoftcap = (level, begin, rate) => {
    if (level.lt(begin)) {
      return level;
    }
    const excess = (level.sub(begin)).div(rate);
    return begin.plus(
      rate.div(2).times(Decimal.sqrt(excess.times(4).add(1)).sub(1)),
    );
  };
  scaledLevel = instabilitySoftcap(
    scaledLevel,
    staticFactors.instability,
    new Decimal(500),
  );
  scaledLevel = instabilitySoftcap(
    scaledLevel,
    staticFactors.hyperInstability,
    new Decimal(400),
  );

  const scalePenalty = scaledLevel.gt(0) ? baseLevel.div(scaledLevel) : DC.D1;
  const incAfterInstability = staticFactors.achievements.add(
    staticFactors.realityUpgrades,
  );
  baseLevel = baseLevel.add(incAfterInstability);
  scaledLevel = scaledLevel.add(incAfterInstability);
  return {
    ep: sources.ep,
    repl: sources.repl,
    dt: sources.dt,
    eter: sources.eternities,
    perkShop: staticFactors.perkShop,
    scalePenalty,
    rowFactor: staticFactors.realityUpgrades,
    achievementFactor: staticFactors.achievements,
    shardFactor,
    singularityEffect,
    rawLevel: baseLevel,
    actualLevel: Decimal.max(1, scaledLevel),
  };
}

// Calculates glyph weights which don't change over the course of a reality unless particular events occur; this is
// stored in the GameCache and only invalidated as needed
export function staticGlyphWeights() {
  const perkShop = PerkShopUpgrade.glyphLevel.effectOrDefault(DC.D1);
  const instability = Glyphs.instabilityThreshold;
  const hyperInstability = Glyphs.hyperInstabilityThreshold;
  const realityUpgrades
    = [Array.range(1, 5).every(x => RealityUpgrade(x).boughtAmount.gt(0))]
      .concat(
        Array.range(1, 4).map(x =>
          Array.range(1, 5).every(y => RealityUpgrade(5 * x + y).isBought),
        ),
      )
      .filter(x => x)
      .length;
  const achievements = Effects.sum(Achievement(148), Achievement(166));
  return {
    perkShop,
    instability,
    hyperInstability,
    realityUpgrades,
    achievements,
  };
}
