import { DC } from "./constants";

// Slowdown parameters for replicanti growth, interval will increase by scaleFactor for every scaleLog10
// OoM past the cap (default is 308.25 (log10 of 1.8e308), 1.2, Number.MAX_VALUE)
export const ReplicantiGrowth = {
  get scaleLog10() {
    return Math.log10(Number.MAX_VALUE);
  },
  get scaleFactor() {
    let factor = 2;
    if (GluonUpgrade.greenBlue(2).isBought) {
      factor = Math.pow(factor, GluonUpgrade.greenBlue(2).effectOrDefault(1));
    }
    return factor;
  },
};

// Internal function to add RGs; called both from within the fast replicanti code and from the function
// used externally. Only called in cases of automatic RG and does not actually modify replicanti amount
function addReplicantiGalaxies(newGalaxies) {
  if (newGalaxies.gte(0)) {
    player.replicanti.galaxies = player.replicanti.galaxies.add(newGalaxies);
    player.requirementChecks.eternity.noRG = false;
    const keepResources = Pelle.isDoomed
      ? PelleUpgrade.replicantiGalaxyEM40.canBeApplied
      : EternityMilestone.replicantiNoReset.isReached;
    if (!keepResources) {
      player.dimensionBoosts = DC.D0;
      softReset(0, true, true);
    }
  }
}

// Function called externally for gaining RGs, which adjusts replicanti amount before calling the function
// which actually adds the RG. Called externally both automatically and manually
export function replicantiGalaxy(auto) {
  if (RealityUpgrade(6).isLockingMechanics) {
    if (!auto) {
      RealityUpgrade(6).tryShowWarningModal();
    }
    return;
  }
  if (!Replicanti.galaxies.canBuyMore) {
    return;
  }
  const galaxyGain = Replicanti.galaxies.gain;
  if (galaxyGain.lt(1)) {
    return;
  }
  player.replicanti.timer = DC.D0;
  if (!QuantumSpeedrunMilestone(20).isReached) {
    Replicanti.amount = Achievement(126).isUnlocked && !Pelle.isDoomed
      ? Decimal.pow10(
          Replicanti.amount.max(1).log10().sub(galaxyGain.mul(LOG10_MAX_VALUE)),
        )
      : new Decimal(1);
  }
  addReplicantiGalaxies(galaxyGain);
}

// Only called on manual RG requests
export function replicantiGalaxyRequest() {
  if (!Replicanti.galaxies.canBuyMore) {
    return;
  }
  if (RealityUpgrade(6).isLockingMechanics) {
    RealityUpgrade(6).tryShowWarningModal();
  } else if (player.options.confirmations.replicantiGalaxy) {
    Modal.replicantiGalaxy.show();
  } else {
    replicantiGalaxy(false);
  }
}

// Produces replicanti quickly below e308, will auto-bulk-RG if production is fast enough
// Returns the remaining unused gain factor
function fastReplicantiBelow308(log10GainFactor, isAutobuyerActive) {
  const shouldBuyRG = isAutobuyerActive
    && !RealityUpgrade(6).isLockingMechanics;
  // More than e308 galaxies per tick causes the game to die, and I don't think it's worth the performance hit of
  // Decimalifying the entire calculation.  And yes, this can and does actually happen super-lategame.
  const uncappedAmount = DC.E1.pow(
    log10GainFactor.plus(Replicanti.amount.max(1).log10()),
  );
  // Checking for uncapped equaling zero is because Decimal.pow returns zero for overflow for some reason
  if (log10GainFactor.gt(Number.MAX_VALUE) || uncappedAmount.eq(0)) {
    if (shouldBuyRG) {
      addReplicantiGalaxies(
        Replicanti.galaxies.max.sub(player.replicanti.galaxies),
      );
    }
    Replicanti.amount = replicantiCap();
    // Basically we've used nothing.
    return log10GainFactor;
  }

  if (!shouldBuyRG) {
    const remainingGain = log10GainFactor.minus(
      replicantiCap().max(1).log10()
        .sub(Replicanti.amount.max(1).log10()),
    ).clampMin(0);
    Replicanti.amount = Decimal.min(uncappedAmount, replicantiCap());
    return remainingGain;
  }

  const gainNeededPerRG = DC.NUMMAX.max(1).log10();
  const replicantiExponent = log10GainFactor.add(
    Replicanti.amount.max(1).log10(),
  );
  const toBuy = Decimal.floor(
    Decimal.min(
      replicantiExponent.div(gainNeededPerRG),
      Replicanti.galaxies.max.sub(player.replicanti.galaxies),
    ),
  );
  const maxUsedGain = gainNeededPerRG.times(toBuy).add(
    replicantiCap().max(1).log10(),
  ).sub(Replicanti.amount.max(1).log10());
  const remainingGain = log10GainFactor.minus(maxUsedGain).clampMin(0);
  Replicanti.amount = Decimal.pow10(
    replicantiExponent.sub(gainNeededPerRG.times(toBuy)),
  )
    .clampMax(replicantiCap());
  addReplicantiGalaxies(toBuy);
  return remainingGain;
}

// When the amount is exactly the cap, there are two cases: the player can go
// over cap (in which case interval should be as if over cap) or the player
// has just crunched and is still at cap due to "Is this safe?" reward
// (in which case interval should be as if not over cap). This is why we have
// the overCapOverride parameter, to tell us which case we are in.
export function getReplicantiInterval(overCapOverride, intervalIn) {
  let interval = new Decimal(intervalIn || player.replicanti.interval);
  const amount = Replicanti.amount;
  const overCap = overCapOverride === undefined
    ? amount.gt(replicantiCap())
    : overCapOverride;
  if ((TimeStudy(133).isBought && !Achievement(138).isUnlocked) || overCap) {
    interval = interval.times(10);
  }

  if (overCap) {
    let increases = (amount.max(1).log10().sub(replicantiCap().max(1).log10()))
      .div(ReplicantiGrowth.scaleLog10);
    if (PelleStrikes.eternity.hasStrike && amount.gte(DC.E2000)) {
      // The above code assumes in this case there's 10x scaling for every 1e308 increase;
      // in fact, before e2000 it's only 2x.
      increases = increases.sub(
        Decimal.log10(5).times(DC.E2000.sub(replicantiCap()).max(1).log10())
          .div(ReplicantiGrowth.scaleLog10),
      );
    }
    interval = interval.times(
      Decimal.pow(ReplicantiGrowth.scaleFactor, increases),
    );
  }

  interval = interval.divide(totalReplicantiSpeedMult(overCap));

  if (V.isRunning) {
    // This is a boost if interval < 1, but that only happens in EC12
    // and handling it would make the replicanti code a lot more complicated.
    // Is an if/else statemenet that complicated?
    if (interval.lt(1)) interval = interval.sqrt();
    else interval = interval.pow(2);
  }
  return interval;
}

// This only counts the "external" multipliers - that is, it doesn't count any speed changes due to being over the cap.
// These multipliers are separated out largely for two reasons - more "dynamic" multipliers (such as overcap scaling
// and celestial nerfs) interact very weirdly and the game balance relies on this behavior, and we also use this same
// value in the multiplier tab too
export function totalReplicantiSpeedMult(overCap) {
  let totalMult = DC.D1;

  // These are the only effects active in Pelle - the function shortcuts everything else if we're in Pelle
  totalMult = totalMult.times(PelleRifts.decay.effectValue);
  totalMult = totalMult.times(Pelle.specialGlyphEffect.replication);
  if (Pelle.isDisabled("replicantiIntervalMult")) {
    return totalMult;
  }

  const preCelestialEffects = Effects.product(
    TimeStudy(62),
    TimeStudy(213),
    DilationUpgrade.dilatedTimeToReplicanti,
    GluonUpgrade.greenBlue(1),
    RealityUpgrade(2),
    RealityUpgrade(6),
    RealityUpgrade(23),
  );
  totalMult = totalMult.times(preCelestialEffects);
  if (TimeStudy(132).isBought) {
    totalMult = totalMult.times(Perk.studyPassive.isBought ? 3 : 1.5);
  }

  if (!overCap && Achievement(134).isUnlocked) {
    totalMult = totalMult.times(2);
  }
  totalMult = totalMult.times(getAdjustedGlyphEffect("replicationspeed"));
  if (GlyphAlteration.isAdded("replication")) {
    totalMult = totalMult
      .times(
        Replicanti.amount.max(1).log10().mul(
          getSecondaryGlyphEffect("replicationdtgain"),
        ).clampMin(1),
      );
  }
  totalMult = totalMult.timesEffectsOf(
    AlchemyResource.replication,
    Ra.unlocks.continuousTTBoost.effects.replicanti,
  );

  return totalMult.clampMin(1);
}

export function replicantiCap() {
  return EffarigUnlock.infinity.canBeApplied
    ? Currency.infinitiesTotal.value
        .pow(TimeStudy(31).isBought ? 120 : 30)
        .clampMin(1)
        .times(DC.NUMMAX)
    : DC.NUMMAX;
}

export function replicantiLoop(diff) {
  if (!player.replicanti.unl) {
    return;
  }
  const replicantiBeforeLoop = Replicanti.amount;
  PerformanceStats.start("Replicanti");
  EventHub.dispatch(GAME_EVENT.REPLICANTI_TICK_BEFORE);
  // This gets the pre-cap interval (above the cap we recalculate the interval).
  const interval = getReplicantiInterval(false);
  const isUncapped = Replicanti.isUncapped;
  const areRGsBeingBought = Replicanti.galaxies.areBeingBought;

  // Figure out how many ticks to calculate for and roll over any leftover time to the next tick. The rollover
  // calculation is skipped if there's more than 100 replicanti ticks per game tick to reduce round-off problems.
  let tickCount = Decimal.divide(diff.add(player.replicanti.timer), interval);
  if (tickCount.lt(100)) {
    player.replicanti.timer = tickCount.minus(tickCount.floor()).times(
      interval,
    );
  } else {
    player.replicanti.timer = DC.D0;
  }
  tickCount = tickCount.floor();

  const singleTickAvg = Replicanti.amount.times(Replicanti.chance);
  // Note that code inside this conditional won't necessarily run every game tick; when game ticks are slower than
  // replicanti ticks, then tickCount will look like [0, 0, 0, 1, 0, 0, ...] on successive game ticks
  if (tickCount.gte(100) || (singleTickAvg.gte(10) && tickCount.gte(1))) {
    // Fast gain: If we're doing a very large number of ticks or each tick produces a lot, then continuous growth
    // every replicanti tick is a good approximation and less intensive than distribution samples. This path will
    // always happen above 1000 replicanti due to how singleTickAvg is calculated, so the over-cap math is only
    // present on this path
    let postScale = Decimal.log10(ReplicantiGrowth.scaleFactor).div(
      ReplicantiGrowth.scaleLog10,
    );
    if (V.isRunning) {
      postScale = postScale.mul(2);
    }

    // Note that remainingGain is in log10 terms.
    let remainingGain = tickCount.times(Replicanti.chance.add(1).ln())
      .times(LOG10_E);
    // It is intended to be possible for both of the below conditionals to trigger.
    if (!isUncapped || Replicanti.amount.lte(replicantiCap())) {
      // Some of the gain is "used up" below e308, but if replicanti are uncapped
      // then some may be "left over" for increasing replicanti beyond their cap.
      remainingGain = fastReplicantiBelow308(remainingGain, areRGsBeingBought);
    }
    if (
      isUncapped && Replicanti.amount.gte(replicantiCap())
      && remainingGain.gt(0)
    ) {
      // Recalculate the interval (it may have increased due to additional replicanti, or,
      // far less importantly, decreased due to Reality Upgrade 6 and additional RG).
      // Don't worry here about the lack of e2000 scaling in Pelle on the first tick
      // (with replicanti still under e2000) causing a huge replicanti jump;
      // there's code later to stop replicanti from increasing by more than e308
      // in a single tick in Pelle.
      const intervalRatio = getReplicantiInterval(true).div(interval);
      remainingGain = remainingGain.div(intervalRatio);
      Replicanti.amount = remainingGain.div(LOG10_E).times(postScale).plus(1)
        .ln().div(postScale)
        .add(Replicanti.amount.clampMin(1).ln()).exp();
    }
  } else if (tickCount.gt(1)) {
    // Multiple ticks but "slow" gain: This happens at low replicanti chance and amount with a fast interval, which
    // can happen often in early cel7. In this case we "batch" ticks together as full doubling events and then draw
    // from a Poisson distribution for how many times to do that. Any leftover ticks are used as binomial samples
    const batchTicks = Replicanti.chance.add(1).log(2).mul(tickCount)
      .floor();
    const binomialTicks = tickCount.sub(
      batchTicks.div(Replicanti.chance.add(1).log(2)),
    );

    Replicanti.amount = Replicanti.amount.times(
      DC.D2.pow(poissonDistribution(batchTicks)),
    );
    for (let t = 0; t < binomialTicks.floor().toNumber(); t++) {
      const reproduced = binomialDistribution(
        Replicanti.amount,
        Replicanti.chance,
      );
      Replicanti.amount = Replicanti.amount.plus(reproduced);
    }

    // The batching might use partial ticks; we add the rest back to the timer so it gets used next loop
    const leftover = binomialTicks.sub(binomialTicks.floor());
    player.replicanti.timer = player.replicanti.timer.add(
      interval.times(leftover),
    );
  } else if (tickCount.eq(1)) {
    // Single tick: Take a single binomial sample to properly simulate replicanti growth with randomness
    const reproduced = binomialDistribution(
      Replicanti.amount,
      Replicanti.chance,
    );
    Replicanti.amount = Replicanti.amount.plus(reproduced);
  }

  if (!isUncapped) {
    Replicanti.amount = Decimal.min(replicantiCap(), Replicanti.amount);
  }

  if (
    Pelle.isDoomed
    && Replicanti.amount.max(1).log10().sub(replicantiBeforeLoop.max(1).log10())
      .gt(308)
  ) {
    Replicanti.amount = replicantiBeforeLoop.times(1e308);
  }

  if (areRGsBeingBought && Replicanti.amount.gte(DC.NUMMAX)) {
    const buyer = Autobuyer.replicantiGalaxy;
    const isAuto = buyer.canTick && buyer.isEnabled;
    // There might be a manual and auto tick simultaneously; pass auto === true iff the autobuyer is ticking and
    // we aren't attempting to manually buy RG, because this controls modals appearing or not
    replicantiGalaxy(isAuto && !Replicanti.galaxies.isPlayerHoldingR);
  }
  player.records.thisReality.maxReplicanti = player.records.thisReality
    .maxReplicanti
    .clampMin(Replicanti.amount);
  EventHub.dispatch(GAME_EVENT.REPLICANTI_TICK_AFTER);
  PerformanceStats.end();
}

export function replicantiMult() {
  if (MasteryStudy(81).isBought) {
    return Replicanti.amount.clampMin(1)
      .pow(Replicanti.amount.clampMin(1).log10().max(1).log10())
      .plusEffectOf(TimeStudy(21))
      .timesEffectOf(TimeStudy(102))
      .clampMin(1);
  }

  return Decimal.pow(Decimal.log2(Replicanti.amount.clampMin(1)), 2)
    .plusEffectOf(TimeStudy(21))
    .timesEffectOf(TimeStudy(102))
    .clampMin(1)
    .pow(getAdjustedGlyphEffect("replicationpow"));
}

/** @abstract */
class ReplicantiUpgradeState {
  /** @abstract */
  get id() {
    throw new NotImplementedError();
  }

  /** @abstract */
  get value() {
    throw new NotImplementedError();
  }

  /** @abstract */
  set value(value) {
    throw new NotImplementedError();
  }

  /** @abstract */
  get nextValue() {
    throw new NotImplementedError();
  }

  /** @abstract */
  get cost() {
    throw new NotImplementedError();
  }

  /** @abstract */
  set cost(value) {
    throw new Error("Use baseCost to set cost");
  }

  /** @abstract */
  get costIncrease() {
    throw new NotImplementedError();
  }

  get baseCost() {
    return this.cost;
  }

  /** @abstract */
  set baseCost(value) {
    throw new NotImplementedError();
  }

  get cap() {
    return;
  }

  get isCapped() {
    return false;
  }

  /** @abstract */
  get autobuyerMilestone() {
    throw new NotImplementedError();
  }

  get canBeBought() {
    return !this.isCapped && Currency.infinityPoints.gte(this.cost)
      && player.eterc8repl !== 0;
  }

  purchase() {
    if (!this.canBeBought) {
      return;
    }
    Currency.infinityPoints.subtract(this.cost);
    this.baseCost = Decimal.times(this.baseCost, this.costIncrease);
    this.value = this.nextValue;
    if (EternityChallenge(8).isRunning) {
      player.eterc8repl--;
    }
    GameUI.update();
  }

  autobuyerTick() {
    while (this.canBeBought) {
      this.purchase();
    }
  }
}

export const ReplicantiUpgrade = {
  chance: new class ReplicantiChanceUpgrade extends ReplicantiUpgradeState {
    get id() {
      return 1;
    }

    get value() {
      return player.replicanti.chance;
    }

    set value(value) {
      player.replicanti.chance = value;
    }

    get nextValue() {
      return this.nearestPercent(this.value.add(0.01));
    }

    get cost() {
      return player.replicanti.chanceCost.dividedByEffectOf(
        PelleRifts.vacuum.milestones[1],
      );
    }

    get baseCost() {
      return player.replicanti.chanceCost;
    }

    set baseCost(value) {
      player.replicanti.chanceCost = value;
    }

    get costIncrease() {
      return 1e15;
    }

    get cap() {
      // Chance never goes over 100%.
      // That was a lie
      return MasteryStudy(35).isBought ? DC.BEMAX : DC.D1;
    }

    get isCapped() {
      return this.nearestPercent(this.value).gte(this.cap);
    }

    get autobuyerMilestone() {
      return EternityMilestone.autobuyerReplicantiChance;
    }

    autobuyerTick() {
      // Fixed price increase of 1e15; so total cost for N upgrades is:
      // cost + cost * 1e15 + cost * 1e30 + ... + cost * 1e15^(N-1) == cost * (1e15^N - 1) / (1e15 - 1)
      // N = log(IP * (1e15 - 1) / cost + 1) / log(1e15)
      let N = Currency.infinityPoints.value.times(this.costIncrease - 1)
        .dividedBy(this.cost).plus(1).log(this.costIncrease);
      N = Decimal.round(
        Decimal.min(N.floor().div(100).add(this.value), this.cap).sub(
          this.value,
        ).mul(100),
      );
      if (N.lte(0)) {
        return;
      }
      const totalCost = this.cost.times(
        Decimal.pow(this.costIncrease, N).minus(1).dividedBy(
          this.costIncrease - 1,
        ),
      );
      Currency.infinityPoints.subtract(totalCost);
      this.baseCost = this.baseCost.times(Decimal.pow(this.costIncrease, N));
      this.value = this.nearestPercent(N.div(100).add(this.value));
    }

    // Rounding errors suck
    nearestPercent(x) {
      return Decimal.mul(x, 100).round().div(100);
    }
  }(),
  interval: new class ReplicantiIntervalUpgrade extends ReplicantiUpgradeState {
    get id() {
      return 2;
    }

    get value() {
      return player.replicanti.interval;
    }

    set value(value) {
      player.replicanti.interval = value;
    }

    get nextValue() {
      return Decimal.max(this.value.times(0.9), this.cap);
    }

    get cost() {
      return player.replicanti.intervalCost.dividedByEffectOf(
        PelleRifts.vacuum.milestones[1],
      );
    }

    get baseCost() {
      return player.replicanti.intervalCost;
    }

    set baseCost(value) {
      player.replicanti.intervalCost = value;
    }

    get costIncrease() {
      if (MasteryStudy(41).isBought) {
        return Decimal.pow(1e10, this.value.min(1).recip());
      }
      return 1e10;
    }

    get cap() {
      return Effects.min(50, TimeStudy(22), MasteryStudy(41));
    }

    get isCapped() {
      return this.value.lte(this.cap);
    }

    get autobuyerMilestone() {
      return EternityMilestone.autobuyerReplicantiInterval;
    }

    applyModifiers(value) {
      return getReplicantiInterval(undefined, value);
    }
  }(),
  galaxies: new class ReplicantiGalaxiesUpgrade extends ReplicantiUpgradeState {
    get id() {
      return 3;
    }

    get value() {
      return player.replicanti.boughtGalaxyCap;
    }

    set value(value) {
      player.replicanti.boughtGalaxyCap = value;
    }

    get nextValue() {
      return this.value.add(1);
    }

    get cost() {
      return this.baseCost.dividedByEffectsOf(
        TimeStudy(233),
        PelleRifts.vacuum.milestones[1],
      );
    }

    get baseCost() {
      return player.replicanti.galCost;
    }

    set baseCost(value) {
      player.replicanti.galCost = value;
    }

    get distantRGStart() {
      return GlyphInfo.replication.sacrificeInfo.effect().add(100);
    }

    get remoteRGStart() {
      return GlyphInfo.replication.sacrificeInfo.effect().add(1000);
    }

    get costIncrease() {
      const galaxies = this.value;
      let increase = EternityChallenge(6).isRunning || MasteryStudy(36).isBought
        ? DC.E2.pow(galaxies).times(DC.E2)
        : DC.E5.pow(galaxies).times(DC.E25);
      if (galaxies.gte(this.distantRGStart)) {
        increase = increase.times(
          DC.E50.pow(galaxies.sub(this.distantRGStart).add(5)),
        );
      }
      if (galaxies.gte(this.remoteRGStart)) {
        increase = increase.times(
          new Decimal(1e5).powEffectOf(MasteryStudy(36)).log10().pow(
            Decimal.pow(galaxies.sub(this.remoteRGStart).add(1), 2),
          ),
        );
      }
      return increase;
    }

    get autobuyerMilestone() {
      return EternityMilestone.autobuyerReplicantiMaxGalaxies;
    }

    get extra() {
      let extraRGs = Effects.max(0, TimeStudy(131)).add(
        PelleRifts.decay.milestones[2].effectOrDefault(0),
      );
      return extraRGs;
    }

    bulkPurchaseCalc() {
      // Copypasted constants
      const logBase = new Decimal(170);
      const logBaseIncrease = (EternityChallenge(6).isRunning)
        ? DC.D2
        : new Decimal(25);
      const logCostScaling = (EternityChallenge(6).isRunning) ? DC.D2 : DC.D5;
      let distantReplicatedGalaxyStart = GlyphInfo.replication.sacrificeInfo
        .effect().add(100);
      let remoteReplicatedGalaxyStart = GlyphInfo.replication.sacrificeInfo
        .effect().add(1000);
      let logDistantScaling = new Decimal(1e50).log10();
      let logRemoteScaling = new Decimal(1e5).powEffectOf(MasteryStudy(36))
        .log10();

      if (QuantumChallenge(5).isRunning) {
        distantReplicatedGalaxyStart = new Decimal(1);
        remoteReplicatedGalaxyStart = new Decimal(1);
        logDistantScaling = new Decimal(1000);
        logRemoteScaling = new Decimal(25);
      }

      const cur = Currency.infinityPoints.value.times(
        TimeStudy(233).effectOrDefault(1),
      ).max(1).log10();

      if (logBase.gt(cur)) {
        return;
      }

      let a = logCostScaling.div(2);
      let b = logBaseIncrease.sub(logCostScaling.div(2));
      let c = logBase.sub(cur);
      let quadraticSolution = decimalQuadraticSolution(a, b, c).floor();
      if (quadraticSolution.lte(distantReplicatedGalaxyStart)) {
        return quadraticSolution.add(1);
      }
      a = logCostScaling.add(logDistantScaling).div(2);

      b = logBaseIncrease.sub(logCostScaling.div(2)).sub(
        logDistantScaling.times(distantReplicatedGalaxyStart),
      ).add(logDistantScaling.times(4.5));

      c = cur.neg().add(170).add(
        distantReplicatedGalaxyStart.pow(2).times(logDistantScaling).div(2),
      ).sub(distantReplicatedGalaxyStart.times(4.5).times(logDistantScaling));
      quadraticSolution = decimalQuadraticSolution(a, b, c).floor();
      if (quadraticSolution.lte(remoteReplicatedGalaxyStart)) {
        return quadraticSolution.add(1);
      }
      a = logRemoteScaling.div(3);

      b = logCostScaling.add(logDistantScaling).div(2).sub(
        logRemoteScaling.mul(remoteReplicatedGalaxyStart),
      )
        .add(logRemoteScaling.div(2));

      c = logBaseIncrease.sub(logCostScaling.div(2)).sub(
        distantReplicatedGalaxyStart.times(logDistantScaling),
      )
        .add(logDistantScaling.times(4.5)).add(
          remoteReplicatedGalaxyStart.pow(2).mul(logRemoteScaling),
        )
        .sub(remoteReplicatedGalaxyStart.mul(logRemoteScaling));

      const d = cur.neg().add(170).add(
        distantReplicatedGalaxyStart.pow(2).mul(logDistantScaling).div(2),
      )
        .sub(distantReplicatedGalaxyStart.mul(4.5).mul(logDistantScaling))
        .sub(remoteReplicatedGalaxyStart.pow(3).mul(logRemoteScaling).div(3))
        .add(remoteReplicatedGalaxyStart.pow(2).mul(logRemoteScaling).div(2))
        .sub(remoteReplicatedGalaxyStart.mul(logRemoteScaling).div(6));

      return decimalCubicSolution(a, b, c, d, false).floor().add(1);
    }

    autobuyerTick() {
      // This isn't a hot enough autobuyer to worry about doing an actual inverse.
      // (proceeds to inplement an actual inverse)
      const bulk = this.bulkPurchaseCalc();
      if (!bulk || bulk.floor().sub(this.value).lte(0)) {
        return;
      }
      Currency.infinityPoints.subtract(
        this.baseCostAfterCount(this.value).sub(1),
      );
      this.value = this.value.add(bulk.sub(this.value));
      this.baseCost = this.baseCostAfterCount(this.value);
      // The code is weird and if we add one the whole thing goes out to like double + 1, for no reason, so
      // we will instead just do 1 purchase call instead, which can also prevent us overbuying by 1
    }

    baseCostAfterCount(count) {
      const logBase = new Decimal(170);
      const logBaseIncrease = EternityChallenge(6).isRunning ? 2 : 25;
      const logCostScaling = EternityChallenge(6).isRunning ? 2 : 5;
      let distantReplicatedGalaxyStart = GlyphInfo.replication.sacrificeInfo
        .effect().add(100);
      let remoteReplicatedGalaxyStart = GlyphInfo.replication.sacrificeInfo
        .effect().add(1000);
      let logCost = logBase.add(count.times(logBaseIncrease))
        .add((count.times(count.sub(1)).div(2)).times(logCostScaling));

      if (QuantumChallenge(5).isRunning) {
        distantReplicatedGalaxyStart = new Decimal(1);
        remoteReplicatedGalaxyStart = new Decimal(1);
      }

      if (count.gt(distantReplicatedGalaxyStart)) {
        const logDistantScaling = QuantumChallenge(5).isRunning
          ? new Decimal(1000)
          : new Decimal(50);
        // When distant scaling kicks in, the price increase jumps by a few extra steps.
        // So, the difference between successive scales goes 5, 5, 5, 255, 55, 55, ...
        const numDistant = count.sub(distantReplicatedGalaxyStart);
        logCost = logCost.add(
          logDistantScaling.times(numDistant).times(numDistant.add(9)).div(2),
        );
      }
      if (count.gt(remoteReplicatedGalaxyStart)) {
        const logRemoteScaling = QuantumChallenge(5).isRunning
          ? new Decimal(25)
          : new Decimal(1e5).powEffectOf(MasteryStudy(36)).log10();
        const numRemote = count.sub(remoteReplicatedGalaxyStart);
        // The formula x * (x + 1) * (2 * x + 1) / 6 is the sum of the first n squares.
        logCost = logCost.add(
          logRemoteScaling.times(numRemote).times(numRemote.add(1))
            .times(numRemote.times(2).add(1)).div(6),
        );
      }
      return Decimal.pow10(logCost);
    }
  }(),
};

export const Replicanti = {
  get areUnlocked() {
    return player.replicanti.unl;
  },
  reset(force = false) {
    const unlocked = force
      ? false
      : EternityMilestone.unlockReplicanti.isReached;
    player.replicanti = {
      unl: unlocked,
      amount: unlocked ? DC.D1 : DC.D0,
      timer: DC.D0,
      chance: new Decimal(0.01),
      chanceCost: DC.E150,
      interval: DC.E3,
      intervalCost: DC.E140,
      boughtGalaxyCap: DC.D0,
      galaxies: DC.D0,
      galCost: DC.E170,
    };
  },
  unlock(freeUnlock = false) {
    const cost = DC.E140.dividedByEffectOf(PelleRifts.vacuum.milestones[1]);
    if (player.replicanti.unl) {
      return;
    }
    if (freeUnlock || Currency.infinityPoints.gte(cost)) {
      if (!freeUnlock) {
        Currency.infinityPoints.subtract(cost);
      }
      player.replicanti.unl = true;
      player.replicanti.timer = DC.D0;
      Replicanti.amount = DC.D1;
    }
  },
  get amount() {
    return Decimal.fromDecimal(player.replicanti.amount);
  },
  set amount(value) {
    player.replicanti.amount = value;
  },
  get chance() {
    return ReplicantiUpgrade.chance.value;
  },
  galaxies: {
    isPlayerHoldingR: false,
    get bought() {
      return new Decimal(player.replicanti.galaxies);
    },
    get extra() {
      let extraRGs = Decimal.floor(
        Effarig.bonusRG.add(Effects.sum(
          TimeStudy(225),
          TimeStudy(226),
        )).times(TimeStudy(303).effectOrDefault(1)),
      );
      if (PlayerProgress.quantumUnlocked()) {
        extraRGs = extraRGs.times(Quarks.green.effect());
      }
      extraRGs = extraRGs.timesEffectOf(QuantumChallenge(8).reward);
      return extraRGs;
    },
    get total() {
      return this.bought.add(this.extra);
    },
    get max() {
      return ReplicantiUpgrade.galaxies.value.add(
        ReplicantiUpgrade.galaxies.extra,
      );
    },
    get canBuyMore() {
      if (!Replicanti.amount.gte(DC.NUMMAX)) {
        return false;
      }
      return this.bought.lt(this.max);
    },
    get areBeingBought() {
      const buyer = Autobuyer.replicantiGalaxy;
      if (!this.canBuyMore) {
        return false;
      }
      // If the confirmation is enabled, we presume the player wants to confirm each Replicanti Galaxy purchase
      return (buyer.canTick && buyer.isEnabled)
        || (!player.options.confirmations.replicantiGalaxy
          && this.isPlayerHoldingR);
    },
    get gain() {
      if (!this.canBuyMore) {
        return DC.D0;
      }
      if (Achievement(126).isUnlocked) {
        const maxGain = Replicanti.galaxies.max.sub(player.replicanti.galaxies);
        const logReplicanti = Replicanti.amount.max(1).log10();
        return Decimal.min(
          maxGain,
          Decimal.floor(logReplicanti.div(LOG10_MAX_VALUE)),
        );
      }
      return DC.D1;
    },
  },
  get isUncapped() {
    return TimeStudy(192).isBought
      || PelleRifts.vacuum.milestones[1].canBeApplied;
  },

  get chance() {
    let chance = player.replicanti.chance.powEffectOf(MasteryStudy(43));
    return chance;
  },
};
