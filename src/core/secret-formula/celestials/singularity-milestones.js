// Used for UI purposes to give different theming for different kinds of upgrades
export const LAITELA_UPGRADE_DIRECTION = {
  SELF_BOOST: 0,
  BOOSTS_MAIN: 1,
  BOOSTS_LAITELA: 2,
};

export const singularityMilestones = {
  // Infinite
  continuumMult: {
    start: 1,
    repeat: 125,
    increaseThreshold: 20,
    limit: Infinity,
    description: "Continuum percentage multiplier",
    effect: completions => Decimal.mul(completions, 0.03),
    effectFormat: x => formatX(x.add(1), 2, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.BOOSTS_MAIN,
  },
  darkMatterMult: {
    start: 2,
    repeat: 20,
    increaseThreshold: 30,
    limit: Infinity,
    description: "Dark Matter production multiplier",
    effect: completions => Decimal.pow(1.5, completions),
    effectFormat: x => formatX(x, 2, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  darkEnergyMult: {
    start: 3,
    repeat: 120,
    increaseThreshold: 10,
    limit: Infinity,
    description: "Dark Energy production multiplier",
    effect: completions => Decimal.pow(2, completions),
    effectFormat: x => formatX(x, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  darkDimensionCostReduction: {
    start: 4,
    repeat: 40,
    increaseThreshold: 25,
    limit: Infinity,
    description: "Dark Matter Dimension upgrades are cheaper",
    effect: completions => Decimal.pow(0.4, completions),
    effectFormat: x => `/ ${format(x.recip(), 2, 2)}`,
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  singularityMult: {
    id: 5,
    start: 50,
    repeat: 3000,
    increaseThreshold: 5,
    limit: Infinity,
    description: "Singularity gain multiplier",
    effect: completions => Decimal.pow(2, completions),
    effectFormat: x => formatX(x, 2, 0),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  darkDimensionIntervalReduction: {
    start: 10,
    repeat: 100,
    increaseThreshold: 20,
    limit: Infinity,
    description: "Dark Matter Dimension interval decrease",
    effect: completions => Decimal.pow(0.6, completions),
    effectFormat: x => `/ ${format(x.recip(), 2, 2)}`,
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  improvedAscensionDM: {
    start: 200000,
    repeat: 4000,
    increaseThreshold: 15,
    limit: Infinity,
    description: "Ascension affects Dark Matter production more",
    effect: completions => completions.times(100),
    effectFormat: x => formatX(POWER_DM_PER_ASCENSION.add(x), 1, 0),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  // Limited
  ascensionIntervalScaling: {
    start: 1.2e5,
    repeat: 2400,
    limit: 8,
    description: "Dark Matter Dimensions Ascension increases the interval less",
    effect: completions => completions.mul(50).neg().add(1200),
    effectFormat: x => `×${formatInt(x)}`,
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  autoCondense: {
    start: 8,
    repeat: 80,
    limit: 8,
    description:
      "Automatically condense Singularities when reaching a threshold above the cap",
    effect: completions =>
      [
        Infinity,
        1.3,
        1.22,
        1.15,
        1.1,
        1.06,
        1.03,
        1.01,
        1,
      ][completions.toNumber()],
    effectFormat: x => `Cap ${formatX(x, 2, 2)}`,
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  darkDimensionAutobuyers: {
    start: 30,
    repeat: 170,
    limit: 4,
    description: "Dark Matter Dimension Autobuyers",
    effect: completions => completions.toNumber(),
    effectFormat: x => ((x === 0)
      ? "No autobuyers"
      : `Autobuy up to the ${["1st", "2nd", "3rd", "4th"][x - 1]} DMD`),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  ascensionAutobuyers: {
    start: 1e8,
    repeat: 140,
    limit: 4,
    description: "DMD Ascension Autobuyers",
    effect: completions => completions.toNumber(),
    effectFormat: x => ((x === 0)
      ? "No autobuyers"
      : `Ascend up to the ${["1st", "2nd", "3rd", "4th"][x - 1]} DMD`),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  darkAutobuyerSpeed: {
    start: 45,
    repeat: 650,
    limit: 8,
    description: "Autobuyer speed for all DMD Autobuyers",
    effect: completions =>
      [30, 20, 15, 10, 5, 3, 2, 1, 0][completions.toNumber()],
    effectFormat: x => (x === 0 ? "Instant" : `${formatInt(x)}s`),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  realityDEMultiplier: {
    start: 1500,
    repeat: 10000,
    limit: 6,
    description:
      "Dark Energy multiplier based on disabled Dimension count within Lai'tela",
    effect: completions =>
      Decimal.pow(completions.div(20).add(1), Laitela.difficultyTier),
    effectFormat: x => formatX(x, 2, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  improvedSingularityCap: {
    start: 150,
    repeat: 10000,
    limit: 4,
    description: "Increased Singularity gain per cap increase",
    effect: completions => completions.add(11),
    effectFormat: x => `${formatX(x)}`,
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  intervalCostScalingReduction: {
    start: 130000,
    repeat: 50000,
    limit: 5,
    description: "DMD Interval cost scaling is better",
    effect: completions => completions.mul(0.03).sub(1).neg(),
    effectFormat: x => `${formatPow(x, 2, 2)}`,
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  // Unique
  darkFromTesseracts: {
    start: 80,
    repeat: 0,
    limit: 1,
    description: "Tesseracts boost Dark Matter and Dark Energy production",
    effect: () => Decimal.pow(1.1, Tesseracts.effectiveCount),
    effectFormat: x => formatX(x, 2, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.BOOSTS_LAITELA,
  },
  multFromInfinitied: {
    start: 3000,
    repeat: 0,
    limit: 1,
    description: "Infinities boost Dark Matter and Dark Energy production",
    effect: () =>
      Decimal.clampMin(
        Currency.infinitiesTotal.value.max(1).log10().div(1000),
        1,
      ),
    effectFormat: x => formatX(x, 2, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.BOOSTS_LAITELA,
  },
  dilatedTimeFromSingularities: {
    start: 8e4,
    repeat: 0,
    limit: 1,
    description:
      "Singularities improve the repeatable Dilated Time multiplier upgrade",
    // Note that at ~2.15x this causes a runaway purely because of cost scaling - no the fuck it doesnt
    effect: () =>
      Decimal.clampMax(
        Currency.singularities.value.max(1).log10().div(100),
        0.35,
      ).add(1),
    effectFormat: x =>
      `${formatX(2)} ➜ ${formatX(Decimal.clampMin(x, 1).mul(2), 2, 2)}`,
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.BOOSTS_MAIN,
  },
  darkFromGlyphLevel: {
    start: 3e6,
    repeat: 0,
    limit: 1,
    description:
      "Boost Dark Matter and Dark Energy production based on highest Glyph level",
    effect: () =>
      Decimal.pow(
        Decimal.clampMin(
          (player.records.bestReality.glyphLevel.sub(1.5e4)).div(2e3),
          1,
        ),
        0.5,
      ),
    effectFormat: x => formatX(x, 2, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.BOOSTS_LAITELA,
  },
  gamespeedFromSingularities: {
    start: 8e7,
    repeat: 0,
    limit: 1,
    description: "Singularities boost game speed",
    effect: () =>
      Decimal.clampMin(
        Decimal.pow(Currency.singularities.value.max(1).log10(), 3),
        1,
      ),
    effectFormat: x => formatX(x, 2, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.BOOSTS_MAIN,
  },
  darkFromTheorems: {
    start: 3e9,
    repeat: 0,
    limit: 1,
    description: "Time Theorems boost Dark Matter and Dark Energy gain",
    effect: () =>
      Decimal.clampMin(
        Currency.timeTheorems.value.max(1).log10().sub(1000).div(50),
        1,
      ).sqrt(),
    effectFormat: x => formatX(x, 2, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.BOOSTS_LAITELA,
  },
  dim4Generation: {
    start: 5e11,
    repeat: 0,
    limit: 1,
    description:
      "Annihilation mult. generates 4th DMD when Annihilation is available",
    effect: () => cloneDeep(Laitela.darkMatterMult),
    effectFormat: x => `${format(x, 2, 1)}/s`,
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  darkFromDM4: {
    start: 5e12,
    repeat: 0,
    limit: 1,
    description:
      "4th Dark Matter Dimension amount boosts Dark Matter and Dark Energy gain",
    effect: () => Decimal.clampMin(DarkMatterDimension(4).amount.pow(0.03), 1),
    effectFormat: x => formatX(x, 2, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  annihilationAutobuyer: {
    start: 4e18,
    repeat: 0,
    limit: 1,
    description: "Unlock an Autobuyer for Annihilation",
    effect: completions => completions,
    effectFormat: x => (x === 1 ? "Unlocked" : "Locked"),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.SELF_BOOST,
  },
  theoremPowerFromSingularities: {
    start: 3e21,
    repeat: 0,
    limit: 1,
    description: "Singularities give a power effect to Time Theorem gain",
    effect: () =>
      Decimal.log10(Currency.singularities.value.add(1)).div(70).add(1),
    effectFormat: x => formatPow(x, 2, 3),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.BOOSTS_MAIN,
  },
  darkFromGamespeed: {
    start: 8e22,
    repeat: 0,
    limit: 1,
    description: "Game speed boosts Dark Matter and Dark Energy production",
    effect: () =>
      Decimal.clampMin(
        Decimal.log10(getGameSpeedupFactor().div(1e120)).div(40),
        1,
      ),
    effectFormat: x => formatX(x, 2, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.BOOSTS_LAITELA,
  },
  glyphLevelFromSingularities: {
    start: 3e24,
    repeat: 0,
    limit: 1,
    description: "Singularities boost pre-instability Glyph level",
    effect: () =>
      Decimal.clampMin(
        Currency.singularities.value.max(1).log10().sub(20).div(30),
        0,
      ).add(1),
    effectFormat: x => formatX(Decimal.clampMin(x, 1), 2, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.BOOSTS_MAIN,
  },
  darkFromDilatedTime: {
    start: 8e33,
    repeat: 0,
    limit: 1,
    description: "Dilated Time boosts Dark Matter production",
    effect: () =>
      Decimal.pow(1.6, Currency.dilatedTime.value.max(1).log10().div(1000)),
    effectFormat: x => formatX(x, 2, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.BOOSTS_LAITELA,
  },
  infinitiedPow: {
    start: 3e38,
    repeat: 0,
    limit: 1,
    description: "Infinities gain a power effect based on Singularities",
    effect: () => Currency.singularities.value.max(1).log10().div(300).add(1),
    effectFormat: x => formatPow(x, 2, 3),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.BOOSTS_MAIN,
  },
  tesseractMultFromSingularities: {
    start: 2.5e45,
    repeat: 0,
    limit: 1,
    description: "Singularities increase effective Tesseract count",
    effect: () => Currency.singularities.value.max(1).log10().div(80).add(1),
    effectFormat: x => formatX(Decimal.clampMin(x, 1), 2, 2),
    upgradeDirection: LAITELA_UPGRADE_DIRECTION.BOOSTS_MAIN,
  },
};
