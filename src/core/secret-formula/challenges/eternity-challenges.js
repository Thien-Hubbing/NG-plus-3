import { DC } from "../../constants";

const specialInfinityGlyphDisabledEffectText
  = () => (PelleRifts.chaos.milestones[1].canBeApplied
    ? "The Pelle-Specific effect from Infinity Glyphs is also disabled."
    : "");

export const eternityChallenges = [
  {
    id: 1,
    description: "Time Dimensions are disabled.",
    goal: DC.E1800,
    goalIncrease: DC.E200,
    reward: {
      description:
        "Time Dimension multiplier based on time spent this Eternity",
      effect: completions =>
        Decimal.pow(
          Decimal.max(player.records.thisEternity.time.div(10), 0.9),
          0.5 + (completions * 0.5),
        ),
      formatEffect: value => formatX(value, 2, 1),
    },
    // These will get notation-formatted and scrambled between for the final goal
    scrambleText: ["1e2600", "1e201600"],
  },
  {
    id: 2,
    description: "Infinity Dimensions are disabled.",
    goal: DC.E975,
    pelleGoal: DC.E1750,
    goalIncrease: DC.E175,
    reward: {
      description: "1st Infinity Dimension multiplier based on Infinity Power",
      effect: completions =>
        Currency.infinityPower.value.pow(1.5 / (700 - completions * 100))
          .clampMin(1),
      cap: DC.E10000,
      formatEffect: value => formatX(value, 2, 1),
    },
  },
  {
    id: 3,
    description:
      "Antimatter Dimensions 5-8 don't produce anything. Dimensional Sacrifice is disabled.",
    goal: DC.E600,
    pelleGoal: DC.E925,
    goalIncrease: DC.E75,
    reward: {
      description: () => `Increase the multiplier for buying ${formatInt(10)} Antimatter Dimensions`,
      effect: completions => completions ** 2,
      formatEffect: value => `+${format(value, 2, 2)}`,
    },
  },
  {
    id: 4,
    description:
      `all Infinity multipliers and generators are disabled. The goal must be reached within a certain
      number of Infinities or else you will fail the Challenge.`,
    goal: DC.E2750,
    goalIncrease: DC.E550,
    restriction: completions => Math.max(16 - 4 * completions, 0),
    checkRestriction: restriction => Currency.infinities.lte(restriction),
    formatRestriction: restriction => (restriction === 0
      ? "without any Infinities"
      : `in ${quantifyInt("Infinity", restriction)} or less`),
    failedRestriction: "(Too many Infinities for more)",
    reward: {
      description: "Infinity Dimension multiplier based on unspent IP",
      effect: completions =>
        Currency.infinityPoints.value.pow(0.003 + completions * 0.002),
      cap: DC.E100000,
      formatEffect: value => formatX(value, 2, 1),
    },
  },
  {
    id: 5,
    description: () =>
      `Antimatter Galaxy cost increase scaling starts immediately (normally at ${formatInt(100)}
      Galaxies). Dimension Boost costs scaling is massively increased.`,
    goal: DC.E750,
    pelleGoal: DC.E1400,
    goalIncrease: DC.E400,
    reward: {
      description: "Distant Galaxy cost scaling starts later",
      effect: completions => Math.pow(3, completions),
      formatEffect: value => `${formatInt(value)} AG later`,
    },
  },
  {
    id: 6,
    // The asterisk, if present, will get replaced with strings generated from the scramble text
    description: () => {
      if (Enslaved.isRunning) {
        return "you *. The cost of upgrading your max Replicanti Galaxies is massively reduced.";
      }
      return "you cannot gain Antimatter Galaxies normally. The cost of upgrading your max Replicanti"
        + " Galaxies is massively reduced.";
    },
    goal: DC.E850,
    pelleGoal: DC.E1500,
    goalIncrease: DC.E250,
    reward: {
      description: "Further reduce Antimatter Dimension cost multiplier growth",
      effect: completions => completions * 0.2,
      formatEffect: (value) => {
        const total = Player.dimensionMultDecrease.add(
          Effects.sum(EternityChallenge(6).reward),
        ).round().sub(value);
        return `-${format(value, 2, 1)} (${formatX(total, 2, 1)} total)`;
      },
    },
    scrambleText: [
      "cannot gain Antimatter Galaxies normally",
      "c㏰'퐚 gai鸭 Anti꟢at랜erﻪﶓa⁍axie㮾 䂇orma㦂l",
    ],
  },
  {
    id: 7,
    description:
      "1st Time Dimensions produce 8th Infinity Dimensions and 1st Infinity Dimensions produce "
      + "7th Antimatter Dimensions. Tickspeed also directly applies to Infinity and Time Dimensions.",
    goal: DC.E2000,
    pelleGoal: DC.E2700,
    goalIncrease: DC.E530,
    effect: () => TimeDimension(1).productionPerSecond,
    reward: {
      description: "1st Time Dimension produces 8th Infinity Dimensions",
      effect: completions =>
        TimeDimension(1).productionPerSecond.pow(completions * 0.25).minus(1)
          .clampMin(0),
      formatEffect: value => `${format(value, 2, 1)} per second`,
    },
  },
  {
    id: 8,
    description: () =>
      `you can only upgrade Infinity Dimensions ${
        formatInt(50)
      } times and Replicanti
      upgrades ${
        formatInt(40)
      } times. Infinity Dimension and Replicanti upgrade autobuyers are disabled.`,
    goal: DC.E1300,
    pelleGoal: DC.E2800,
    goalIncrease: DC.E900,
    reward: {
      description: "Infinity Power strengthens Replicanti Galaxies",
      effect: (completions) => {
        const infinityPower = Currency.infinityPower.value.add(1).max(1).log10().add(1).log10();
        return Decimal.pow(infinityPower, 0.04 * completions).sub(1).max(0);
      },
      formatEffect: value => formatPercents(value, 2),
    },
  },
  {
    id: 9,
    description: () => `you cannot buy Tickspeed upgrades. Infinity Power instead multiplies
      Time Dimensions with greatly reduced effect. ${specialInfinityGlyphDisabledEffectText()}`,
    goal: DC.E1750,
    pelleGoal: DC.E2900,
    goalIncrease: DC.E250,
    reward: {
      description: "Infinity Dimension multiplier based on Time Shards",
      effect: completions =>
        Currency.timeShards.value.pow(completions * 0.1).clampMin(1),
      cap: DC.E11200,
      formatEffect: value => formatX(value, 2, 1),
    },
  },
  {
    id: 10,
    description: () => {
      let description = `Time Dimensions and Infinity Dimensions are disabled. You gain an immense boost from
        Infinities to Antimatter Dimensions (Infinities${formatPow(950)}). ${specialInfinityGlyphDisabledEffectText()}`;
      EternityChallenge(10).applyEffect(v =>
        description += ` Currently: ${formatX(v, 2, 1)}`,
      );
      return description;
    },
    goal: DC.E3000,
    pelleGoal: DC.E3200,
    goalIncrease: DC.E300,
    effect: () =>
      Decimal.pow(Currency.infinitiesTotal.value, 950).clampMin(1).pow(
        TimeStudy(31).effectOrDefault(1),
      ),
    reward: {
      description: "Time Dimension multiplier based on Infinities",
      effect: (completions) => {
        const mult = Currency.infinitiesTotal.value.pow(1 + 0.5 * completions).clampMin(1);
        return mult.powEffectOf(TimeStudy(31));
      },
      formatEffect: (value) => {
        // Since TS31 is already accounted for in the effect prop, we need to "undo" it to display the base value here
        const mult = formatX(value, 2, 1);
        return TimeStudy(31).canBeApplied
          ? `${
            formatX(value.pow(1 / TimeStudy(31).effectValue), 2, 1)
          } (After TS31: ${mult})`
          : mult;
      },
    },
  },
  {
    id: 11,
    description: () =>
      `all Dimension multipliers and powers are disabled except for the multipliers from
      Infinity Power and Dimension Boosts (to Antimatter Dimensions). ${specialInfinityGlyphDisabledEffectText()}`,
    goal: DC.E450,
    pelleGoal: DC.E11200,
    goalIncrease: DC.E200,
    pelleGoalIncrease: DC.E1400,
    reward: {
      description: "Further reduce Tickspeed cost multiplier growth",
      effect: completions => completions * 0.07,
      formatEffect: (value) => {
        const total = Player.tickSpeedMultDecrease.add(
          Effects.sum(EternityChallenge(11).reward),
        ).round().sub(value);
        return `-${format(value, 2, 2)} (${formatX(total, 2, 2)} total)`;
      },
    },
  },
  {
    id: 12,
    description:
      () => (PlayerProgress.realityUnlocked()
        ? `the game runs ×${formatInt(1000)} slower; all other game speed effects are disabled. The goal must be reached
        within a certain amount of time or you will fail the Challenge. ${specialInfinityGlyphDisabledEffectText()}`
        : `the game runs ×${formatInt(1000)} slower. The goal must be reached
        within a certain amount of time or you will fail the Challenge.`),
    goal: DC.E110000,
    pelleGoal: DC.E208000,
    goalIncrease: DC.E12000,
    restriction: completions => Math.max(10 - 2 * completions, 1) / 10,
    checkRestriction: restriction =>
      Time.thisEternity.totalSeconds.lt(restriction),
    formatRestriction: restriction =>
      `in ${quantify("in-game second", restriction, 0, 1)} or less.`,
    failedRestriction: "(Too slow for more)",
    reward: {
      description: "Infinity Dimension cost multipliers are reduced",
      effect: completions => 1 - completions * 0.01,
      formatEffect: value => `x${formatPow(value, 3, 3)}`,
    },
  },
  {
    id: 13,
    description: () =>
      "Infinity Dimensions are disabled and nullify Dimension Boost's effect to Antimatter Dimensions.",
    goal: new Decimal("1e9e6"),
    pelleGoal: DC.BEMAX,
    goalIncrease: new Decimal("e5.555e5"),
    reward: {
      description: "Increase the exponent of the Meta-Antimatter effect.",
      effect: completions => completions / 5,
      formatEffect: value => `+${formatPow(value, 3)}`,
    },
  },
  {
    id: 14,
    description: () =>
      `You are stuck in IC3, and all replicanti boosts except to ID are nullified.
      Free tickspeed upgrades count five times as much towards the IC3 boost, and meta-antimatter is disabled.`,
    goal: new Decimal("1e4e6"),
    pelleGoal: DC.BEMAX,
    goalIncrease: new Decimal("e2.25e5"),
    reward: {
      description:
        "Free tickspeed upgrades from Time Shards boosts the IC3 reward.",
      effect: completions =>
        Decimal.pow(FreeTickspeed.amount, completions / 20).plus(1),
      formatEffect: value => `${formatX(value, 3)}`,
    },
  },
];
