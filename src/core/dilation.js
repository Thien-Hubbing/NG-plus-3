import {
  RebuyableMechanicState,
  SetPurchasableMechanicState,
} from "./game-mechanics";
import { DC } from "./constants";
import FullScreenAnimationHandler from "./full-screen-animation-handler";
import { SpeedrunMilestones } from "./speedrun";

export function animateAndDilate() {
  FullScreenAnimationHandler.display("a-dilate", 2);
  setTimeout(() => {
    startDilatedEternity();
    if (Pelle.isDoomed) {
      PelleStrikes.dilation.trigger();
    }
  }, 1000);
}

export function animateAndUndilate(callback) {
  FullScreenAnimationHandler.display("a-undilate", 2);
  setTimeout(() => {
    eternity(false, false, { switchingDilation: true });
    if (callback) {
      callback();
    }
  }, 1000);
}

export function startDilatedEternityRequest() {
  if (
    !PlayerProgress.dilationUnlocked()
    || (Pelle.isDoomed && !Pelle.canDilateInPelle)
  ) {
    return;
  }
  const playAnimation = player.options.animations.dilation
    && !FullScreenAnimationHandler.isDisplaying;
  if (player.dilation.active) {
    if (player.options.confirmations.dilation) {
      Modal.exitDilation.show();
    } else if (playAnimation) {
      animateAndUndilate();
    } else {
      eternity(false, false, { switchingDilation: true });
    }
  } else if (player.options.confirmations.dilation) {
    Modal.enterDilation.show();
  } else if (playAnimation) {
    animateAndDilate();
  } else {
    startDilatedEternity();
  }
}

export function startDilatedEternity(auto) {
  if (!PlayerProgress.dilationUnlocked()) {
    return false;
  }
  if (GameEnd.creditsEverClosed) {
    return false;
  }
  if (player.dilation.active) {
    eternity(false, auto, { switchingDilation: true });
    return false;
  }
  Achievement(136).unlock();
  eternity(false, auto, { switchingDilation: true });
  player.dilation.active = true;
  if (Pelle.isDoomed) {
    PelleStrikes.dilation.trigger();
  }
  return true;
}

const DIL_UPG_NAMES = [
  null,
  "dtGain",
  "galaxyThreshold",
  "tachyonGain",
  "tachyonExponent",
  "doubleGalaxies",
  "tdMultReplicanti",
  "ndMultDT",
  "dilatedTimeToReplicanti",
  "ipMultDT",
  "timeStudySplit",
  "dilationPenalty",
  "eternitiesDTSynergy",
  "mdMultTickspeed",
  "mdBuffDT",
  "mdEffectBuff",
  "dtMultMA",
  "ttGenerator",
  "dtGainPelle",
  "galaxyMultiplier",
  "tickspeedPower",
  "galaxyThresholdPelle",
  "flatDilationMult",
];

export function buyDilationUpgrade(id, bulk = 1) {
  if (GameEnd.creditsEverClosed) {
    return false;
  }
  // Upgrades 1-3 are rebuyable, and can be automatically bought in bulk with a perk shop upgrade
  const upgrade = DilationUpgrade[DIL_UPG_NAMES[id]];
  if (id > 4 && id < 23) {
    if (player.dilation.upgrades.has(id)) {
      return false;
    }
    if (!Currency.dilatedTime.purchase(upgrade.cost)) {
      return false;
    }
    player.dilation.upgrades.add(id);
    if (id === 5) {
      player.dilation.totalTachyonGalaxies = player.dilation
        .totalTachyonGalaxies.mul(2);
    }
  } else {
    const upgAmount = player.dilation.rebuyables[id];
    if (
      Currency.dilatedTime.lt(upgrade.cost)
      || upgAmount.gte(upgrade.config.purchaseCap)
    ) {
      return false;
    }

    let buying = Decimal.affordGeometricSeries(
      Currency.dilatedTime.value,
      upgrade.config.initialCost,
      upgrade.config.increment,
      upgAmount,
    );
    buying = Decimal.clampMax(buying, bulk);
    buying = Decimal.clampMax(
      buying,
      upgrade.config.purchaseCap.sub(upgAmount),
    );
    const cost = Decimal.sumGeometricSeries(
      buying,
      upgrade.config.initialCost,
      upgrade.config.increment,
      upgAmount,
    );
    Currency.dilatedTime.subtract(cost);
    player.dilation.rebuyables[id] = player.dilation.rebuyables[id].add(buying);
    if (id === 2) {
      if (!Perk.bypassTGReset.isBought || Pelle.isDoomed) {
        Currency.dilatedTime.reset();
      }
      player.dilation.nextThreshold = DC.E3;
      player.dilation.baseTachyonGalaxies = DC.D0;
      player.dilation.totalTachyonGalaxies = DC.D0;
    }

    if (id === 3 && !Pelle.isDisabled("tpMults")) {
      let retroactiveTPFactor = Effects.max(
        DC.D1,
        Perk.retroactiveTP1,
        Perk.retroactiveTP2,
        Perk.retroactiveTP3,
        Perk.retroactiveTP4,
      );
      if (Enslaved.isRunning) {
        retroactiveTPFactor = Decimal.pow(
          retroactiveTPFactor,
          Enslaved.tachyonNerf,
        );
      }
      Currency.tachyonParticles.multiply(
        Decimal.pow(retroactiveTPFactor, buying),
      );
    }
  }
  return true;
}

// Why the fuck is this function so complicated, we could just use affordGeometricSeries/sumGeometricSeries
// on all of the buyables because the cost formula is really simple for all of them
export function maxPurchaseDilationUpgrades() {
  let didBuy = false;
  for (let i = 1; i < 5; i++) {
    didBuy = didBuy || buyDilationUpgrade(i, Infinity);
  }
  return didBuy;
}

export function getTachyonGalaxyMult(thresholdUpgrade) {
  // This specifically needs to be an undefined check because sometimes thresholdUpgrade is zero
  const upgrade = thresholdUpgrade === undefined
    ? DilationUpgrade.galaxyThreshold.effectValue
    : thresholdUpgrade;
  const thresholdMult = upgrade.mul(3.65).add(0.35);
  const glyphEffect = getAdjustedGlyphEffect("dilationgalaxyThreshold");
  const glyphReduction = glyphEffect === 0 ? 1 : glyphEffect;
  const power = DilationUpgrade.galaxyThresholdPelle.canBeApplied
    ? DilationUpgrade.galaxyThresholdPelle.effectValue
    : DC.D1;

  if (QuantumChallenge(5).isRunning) {
    return new Decimal(Math.PI * 100 * 3.65);
  }

  return thresholdMult.mul(glyphReduction).add(1).pow(power);
}

export function getDilationGainPerSecond() {
  if (Pelle.isDoomed) {
    const tachyonEffect = Currency.tachyonParticles.value.pow(
      PelleRifts.paradox.milestones[1].effectOrDefault(1),
    );
    return new Decimal(tachyonEffect)
      .timesEffectsOf(
        DilationUpgrade.dtGain,
        DilationUpgrade.dtGainPelle,
        DilationUpgrade.flatDilationMult,
      )
      .times(Pelle.specialGlyphEffect.dilation).div(1e5);
  }
  let dtRate = new Decimal(Currency.tachyonParticles.value)
    .timesEffectsOf(
      DilationUpgrade.dtGain,
      DilationUpgrade.dtMultMA,
      MasteryStudy(33),
      Achievement(132),
      Achievement(137),
      RealityUpgrade(1),
      AlchemyResource.dilation,
      Ra.unlocks.continuousTTBoost.effects.dilatedTime,
      Ra.unlocks.peakGamespeedDT,
      GluonUpgrade.blueRed(2),
      GluonUpgrade.blueRed(3),
      MasteryStudy(51),
      QuantumChallenge(1).reward,
    )
    .times(
      DilationUpgrade.eternitiesDTSynergy.isBought
        ? Currency.eternities.value.clampMin(1).pow(0.15)
        : 1,
    );
  if (PlayerProgress.quantumUnlocked()) {
    dtRate = dtRate.times(Quarks.blue.effect());
  }
  dtRate = dtRate.times(getAdjustedGlyphEffect("dilationDT"));
  dtRate = dtRate.times(
    Decimal.clampMin(
      Decimal.log10(Replicanti.amount.add(1)).mul(
        getAdjustedGlyphEffect("replicationdtgain"),
      ),
      1,
    ),
  );
  if (Enslaved.isRunning && !dtRate.eq(0)) {
    dtRate = dtRate.plus(1).logPow(0.85);
  }
  if (V.isRunning) {
    dtRate = dtRate.pow(0.5);
  }
  return dtRate;
}

export function tachyonGainMultiplier() {
  if (Pelle.isDisabled("tpMults")) {
    return new Decimal(1);
  }
  const pow = Enslaved.isRunning ? Enslaved.tachyonNerf : 1;
  return DC.D1.timesEffectsOf(
    DilationUpgrade.tachyonGain,
    MasteryStudy(34),
    Achievement(132),
    RealityUpgrade(4),
    RealityUpgrade(8),
    RealityUpgrade(15),
    GluonUpgrade.blueRed(1),
  ).times(GlyphInfo.dilation.sacrificeInfo.effect()).pow(pow);
}

export function rewardTP() {
  Currency.tachyonParticles.bumpTo(
    getTP(player.records.thisEternity.maxAM, true),
  );
  player.dilation.lastEP = Currency.eternityPoints.value;
}

// This function exists to apply Teresa-25 in a consistent way; TP multipliers can be very volatile and
// applying the reward only once upon unlock promotes min-maxing the upgrade by unlocking dilation with
// TP multipliers as large as possible. Applying the reward to a base TP value and letting the multipliers
// act dynamically on this fixed base value elsewhere solves that issue
export function getBaseTP(antimatter, requireEternity) {
  if (!Player.canEternity && requireEternity) {
    return DC.D0;
  }
  const am = (isInCelestialReality() || Pelle.isDoomed)
    ? antimatter
    : Ra.unlocks.unlockDilationStartingTP.effectOrDefault(antimatter);
  let baseTP = am.max(1).log10().div(Math.log10(Number.MAX_VALUE)).pow(
    Decimal.add(1.5, DilationUpgrade.tachyonExponent.effectOrDefault(0)),
  );
  if (Enslaved.isRunning) {
    baseTP = baseTP.pow(Enslaved.tachyonNerf);
  }
  return baseTP;
}

// Returns the TP that would be gained this run
export function getTP(antimatter, requireEternity) {
  return softcap({
    baseResource: getBaseTP(antimatter, requireEternity).times(tachyonGainMultiplier()),
    softcapStart: DC.NUMMAX,
    softcapPower: 1 / 3,
    softcapType: SOFTCAP_MODES.POLYNOMIAL,
  });
}

// Returns the amount of TP gained, subtracting out current TP; used for displaying gained TP, text on the
// "exit dilation" button (saying whether you need more antimatter), and in last 10 eternities
export function getTachyonGain(requireEternity) {
  return getTP(Currency.antimatter.value, requireEternity).minus(
    Currency.tachyonParticles.value,
  ).clampMin(0);
}

// Returns the minimum antimatter needed in order to gain more TP; used only for display purposes
export function getTachyonReq() {
  let effectiveTP = Currency.tachyonParticles.value
    .dividedBy(tachyonGainMultiplier());
  return Decimal.pow10(
    effectiveTP
      .times(
        Decimal.pow(
          400,
          Decimal.add(1.5, DilationUpgrade.tachyonExponent.effectOrDefault(0)),
        ),
      )
      .pow(Decimal.add(1.5, DilationUpgrade.tachyonExponent.effectOrDefault(0)).recip()),
  );
}

export function getDilationTimeEstimate(goal) {
  const currentDTGain = getDilationGainPerSecond();
  const rawDTGain = currentDTGain.times(getGameSpeedupForDisplay());
  const currentDT = Currency.dilatedTime.value;
  if (currentDTGain.eq(0)) {
    return null;
  }
  if (PelleRifts.paradox.isActive) {
    const drain = Pelle.riftDrainPercent;
    const goalNetRate = rawDTGain.minus(Decimal.multiply(goal, drain));
    const currNetRate = rawDTGain.minus(currentDT.times(drain));
    if (goalNetRate.lt(0)) {
      return "Never affordable due to Rift drain";
    }
    return TimeSpan.fromSeconds(currNetRate.div(goalNetRate).ln().div(drain))
      .toTimeEstimate();
  }
  return TimeSpan.fromSeconds(
    Decimal.sub(goal, currentDT)
      .div(rawDTGain),
  ).toTimeEstimate();
}

export function dilatedValueOf(value) {
  const log10 = value.eq(0) ? DC.D0 : value.log10();
  const dilationPenalty = Effects.product(DilationUpgrade.dilationPenalty)
    .times(0.75);
  return Decimal.pow10(
    log10.abs().pow(dilationPenalty).times(Decimal.sign(log10)),
  );
}

class DilationUpgradeState extends SetPurchasableMechanicState {
  get currency() {
    return Currency.dilatedTime;
  }

  get set() {
    return player.dilation.upgrades;
  }

  onPurchased() {
    if (this.id === 4) {
      player.dilation.totalTachyonGalaxies = player.dilation
        .totalTachyonGalaxies.mul(2);
    }
    if (this.id === 10) {
      SpeedrunMilestones(15).tryComplete();
    }
  }
}

class RebuyableDilationUpgradeState extends RebuyableMechanicState {
  get currency() {
    return Currency.dilatedTime;
  }

  get boughtAmount() {
    return player.dilation.rebuyables[this.id];
  }

  set boughtAmount(value) {
    player.dilation.rebuyables[this.id] = value;
  }

  get isCapped() {
    return this.config.reachedCap();
  }

  purchase(bulk) {
    buyDilationUpgrade(this.config.id, bulk);
  }
}

export const DilationUpgrade = mapGameDataToObject(
  GameDatabase.eternity.dilation,
  config => (config.rebuyable
    ? new RebuyableDilationUpgradeState(config)
    : new DilationUpgradeState(config)),
);

export const DilationUpgrades = {
  rebuyable: [
    DilationUpgrade.dtGain,
    DilationUpgrade.galaxyThreshold,
    DilationUpgrade.tachyonGain,
  ],
  fromId: id => DilationUpgrade.all.find(x => x.id === Number(id)),
};
