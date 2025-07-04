import { DC } from "../../constants";

export const alchemyResources = {
  // T1 resources (Non-Effarig "base" resources)
  power: {
    id: ALCHEMY_RESOURCE.POWER,
    name: "Power",
    symbol: "Ω",
    isBaseResource: true,
    effect: amount => amount.div(200000).add(1),
    tier: 1,
    uiOrder: 1,
    unlockedAt: 2,
    description: "provides a power to Antimatter Dimensions",
    formatEffect: value =>
      `Antimatter Dimension multipliers ${formatPow(value, 4, 4)}`,
  },
  infinity: {
    id: ALCHEMY_RESOURCE.INFINITY,
    name: "Infinity",
    symbol: "∞",
    isBaseResource: true,
    effect: amount => amount.div(200000).add(1),
    tier: 1,
    uiOrder: 2,
    unlockedAt: 3,
    description: "provides a power to Infinity Dimensions",
    formatEffect: value =>
      `Infinity Dimension multipliers ${formatPow(value, 4, 4)}`,
  },
  time: {
    id: ALCHEMY_RESOURCE.TIME,
    name: "Time",
    symbol: "Δ",
    isBaseResource: true,
    effect: amount => amount.div(200000).add(1),
    tier: 1,
    uiOrder: 3,
    unlockedAt: 4,
    description: "provides a power to Time Dimensions",
    formatEffect: value =>
      `Time Dimension multipliers ${formatPow(value, 4, 4)}`,
  },
  replication: {
    id: ALCHEMY_RESOURCE.REPLICATION,
    name: "Replication",
    symbol: "Ξ",
    isBaseResource: true,
    effect: amount => Decimal.pow10(amount.div(1000)),
    tier: 1,
    uiOrder: 4,
    unlockedAt: 5,
    description: "increases Replication speed",
    formatEffect: value =>
      `Replication speed is increased by ${formatX(value, 2, 2)}`,
  },
  dilation: {
    id: ALCHEMY_RESOURCE.DILATION,
    name: "Dilation",
    symbol: "Ψ",
    isBaseResource: true,
    effect: amount => Decimal.pow10(amount.div(2000)),
    tier: 1,
    uiOrder: 5,
    unlockedAt: 6,
    description: "increases Dilated Time production",
    formatEffect: value =>
      `Dilated Time production is increased by ${formatX(value, 2, 2)}`,
  },

  // T2 resources (combinations of pairs of T1 resources)
  cardinality: {
    id: ALCHEMY_RESOURCE.CARDINALITY,
    name: "Cardinality",
    symbol: "α",
    isBaseResource: false,
    effect: amount => Decimal.div(0.2, amount.div(20000).add(1)).add(1),
    tier: 2,
    uiOrder: 3,
    unlockedAt: 8,
    description: "reduces Replicanti slowdown when above the cap",
    formatEffect: value =>
      `Replicanti interval increases slower ${formatX(1.2, 1, 1)} ➜
      ${formatX(value, 4, 4)} per ${format(Number.MAX_VALUE, 2)}`,
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.TIME,
        amount: DC.D8,
      },
      {
        resource: ALCHEMY_RESOURCE.REPLICATION,
        amount: DC.D7,
      },
    ],
  },
  eternity: {
    id: ALCHEMY_RESOURCE.ETERNITY,
    name: "Eternity",
    symbol: "τ",
    isBaseResource: false,
    effect: amount => amount.div(15000).add(1),
    tier: 2,
    uiOrder: 2,
    unlockedAt: 9,
    description: "provides a power to Eternity generation",
    formatEffect: value => `Eternity generation ${formatPow(value, 4, 4)}`,
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.TIME,
        amount: DC.D11,
      },
      {
        resource: ALCHEMY_RESOURCE.INFINITY,
        amount: DC.D4,
      },
    ],
  },
  dimensionality: {
    id: ALCHEMY_RESOURCE.DIMENSIONALITY,
    name: "Dimensionality",
    symbol: "ρ",
    isBaseResource: false,
    effect: amount => Decimal.pow10(amount.times(5)),
    tier: 2,
    uiOrder: 1,
    unlockedAt: 10,
    description: "provides a large multiplier to all Dimensions",
    formatEffect: value => `All Dimensions ${formatX(value)}`,
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.POWER,
        amount: DC.D10,
      },
      {
        resource: ALCHEMY_RESOURCE.INFINITY,
        amount: DC.D5,
      },
    ],
  },
  inflation: {
    id: ALCHEMY_RESOURCE.INFLATION,
    name: "Inflation",
    symbol: "λ",
    isBaseResource: false,
    effect: amount =>
      Decimal.pow10(new Decimal(6e9).sub(amount.mul(3e5)).clampMin(0)),
    tier: 2,
    uiOrder: 5,
    unlockedAt: 11,
    description: "provides an additional power for very large multipliers",
    formatEffect: value =>
      `All Antimatter Dimension multipliers are ${formatPow(1.05, 2, 2)}
      if they are above ${format(value)} `,
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.POWER,
        amount: DC.D9,
      },
      {
        resource: ALCHEMY_RESOURCE.DILATION,
        amount: DC.D6,
      },
    ],
  },
  alternation: {
    id: ALCHEMY_RESOURCE.ALTERNATION,
    name: "Alternation",
    symbol: "ω",
    isBaseResource: false,
    effect: amount => amount.div(200000),
    tier: 2,
    uiOrder: 4,
    unlockedAt: 12,
    description:
      "increases the strength of Tachyon Galaxies based on Replicanti",
    formatEffect: value =>
      `Tachyon Galaxies are ${formatPercents(value, 2, 2)} stronger
      per ${format(DC.E1E6)} Replicanti`,
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.REPLICATION,
        amount: DC.D5,
      },
      {
        resource: ALCHEMY_RESOURCE.DILATION,
        amount: DC.D10,
      },
    ],
  },

  // T3 resources (Effarig and conbinations of T1/T2 with Effarig)
  effarig: {
    id: ALCHEMY_RESOURCE.EFFARIG,
    name: "Effarig",
    symbol: "Ϙ",
    isBaseResource: true,
    effect: amount => Decimal.pow(10, amount.div(2500)),
    tier: 1,
    uiOrder: 1.5,
    unlockedAt: 7,
    description: "increases Relic Shard gain",
    formatEffect: value =>
      `Relic Shard gain is multiplied ${formatX(value, 2, 2)}`,
  },
  synergism: {
    id: ALCHEMY_RESOURCE.SYNERGISM,
    name: "Synergism",
    symbol: "π",
    isBaseResource: false,
    effect: (amount) => {
      const rawValue = Decimal.sqrt(amount.div(25000)).mul(1.3).add(0.3);
      return Achievement(175).isUnlocked ? rawValue : Decimal.min(rawValue, 1);
    },
    tier: 3,
    uiOrder: 2,
    unlockedAt: 13,
    description: "increases the yield of Alchemy Reactions",
    formatEffect(value) {
      return `Alchemy Reaction efficiency ${formatPercents(0.3)} ➜ ${
        formatPercents(value, 2, 2)
      }
        ${(!Achievement(175).isUnlocked && value.gte(1)) ? " (Capped)" : ""}`;
    },
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.EFFARIG,
        amount: DC.D3,
      },
      {
        resource: ALCHEMY_RESOURCE.REPLICATION,
        amount: DC.D16,
      },
      {
        resource: ALCHEMY_RESOURCE.INFINITY,
        amount: DC.D14,
      },
    ],
  },
  momentum: {
    id: ALCHEMY_RESOURCE.MOMENTUM,
    name: "Momentum",
    symbol: "μ",
    isBaseResource: false,
    effect: amount => amount.div(125000).add(1),
    tier: 3,
    uiOrder: 3,
    unlockedAt: 15,
    description:
      "provides a power to all Dimensions that permanently grows over time",
    formatEffect: value =>
      `All Dimensions ${formatPow(Ra.momentumValue, 4, 4)}, increasing by
      ${format(0.005 * Achievement(175).effectOrDefault(1), 3, 3)}
      per real-time hour after the resource is unlocked, up to a maximum of ${
        formatPow(value, 4, 4)
      }`,
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.EFFARIG,
        amount: DC.D11,
      },
      {
        resource: ALCHEMY_RESOURCE.POWER,
        amount: DC.D4,
      },
      {
        resource: ALCHEMY_RESOURCE.TIME,
        amount: DC.D20,
      },
    ],
  },
  decoherence: {
    id: ALCHEMY_RESOURCE.DECOHERENCE,
    name: "Decoherence",
    symbol: "ξ",
    isBaseResource: false,
    effect: amount => Decimal.sqrt(amount.div(25000)).mul(0.15),
    tier: 3,
    uiOrder: 4,
    unlockedAt: 14,
    description: "gives all basic Alchemy Resources upon refinement",
    formatEffect: value =>
      `Refined Glyphs also give ${formatPercents(value, 2)} of their value `
      + "to all other base resources",
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.EFFARIG,
        amount: DC.D13,
      },
      {
        resource: ALCHEMY_RESOURCE.ALTERNATION,
        amount: DC.D8,
      },
    ],
  },

  // T4 resources (resources which feed directly into the final resource)
  exponential: {
    id: ALCHEMY_RESOURCE.EXPONENTIAL,
    name: "Exponential",
    symbol: "Γ",
    isBaseResource: false,
    effect: amount => Decimal.pow(amount.div(10000), 2).mul(10),
    tier: 4,
    uiOrder: 2,
    unlockedAt: 18,
    description: "multiplies Infinity Points based on Replicanti",
    formatEffect: value =>
      `Infinity Points multiplied by Replicanti${formatPow(value, 2, 3)}`,
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.INFLATION,
        amount: DC.D18,
      },
      {
        resource: ALCHEMY_RESOURCE.SYNERGISM,
        amount: DC.D3,
      },
    ],
  },
  force: {
    id: ALCHEMY_RESOURCE.FORCE,
    name: "Force",
    symbol: "Φ",
    isBaseResource: false,
    effect: amount => amount.mul(5),
    tier: 4,
    uiOrder: 2,
    unlockedAt: 17,
    description: "multiplies Antimatter Dimensions based on Reality Machines",
    formatEffect: value =>
      `Multiply Antimatter Dimensions by Reality Machines${
        formatPow(value, 2, 2)
      }`,
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.DIMENSIONALITY,
        amount: DC.D7,
      },
      {
        resource: ALCHEMY_RESOURCE.MOMENTUM,
        amount: DC.D8,
      },
    ],
  },
  uncountability: {
    id: ALCHEMY_RESOURCE.UNCOUNTABILITY,
    name: "Uncountability",
    symbol: "Θ",
    isBaseResource: false,
    effect: amount => Decimal.sqrt(amount.div(25000)).mul(160),
    tier: 4,
    uiOrder: 3,
    unlockedAt: 19,
    description: "passively generates Realities and Perk Points",
    formatEffect: value =>
      `Generate ${format(value, 2, 2)} Realities and Perk Points per second`,
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.INFINITY,
        amount: DC.D20,
      },
      {
        resource: ALCHEMY_RESOURCE.EFFARIG,
        amount: DC.D6,
      },
      {
        resource: ALCHEMY_RESOURCE.CARDINALITY,
        amount: DC.D16,
      },
    ],
  },
  boundless: {
    id: ALCHEMY_RESOURCE.BOUNDLESS,
    name: "Boundless",
    symbol: "Π",
    isBaseResource: false,
    effect: amount => amount.div(80000),
    tier: 4,
    uiOrder: 1,
    unlockedAt: 20,
    description: "makes Tesseracts stronger",
    formatEffect: value =>
      `Tesseracts are +${formatPercents(value, 2, 2)} stronger`,
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.ETERNITY,
        amount: DC.D13,
      },
      {
        resource: ALCHEMY_RESOURCE.INFLATION,
        amount: DC.D18,
      },
    ],
  },
  multiversal: {
    id: ALCHEMY_RESOURCE.MULTIVERSAL,
    name: "Multiversal",
    symbol: "Σ",
    isBaseResource: false,
    effect: amount => Decimal.pow(amount.div(25000), 2).mul(32),
    tier: 4,
    uiOrder: 5,
    unlockedAt: 16,
    description: "makes each Reality simulate more Realities",
    formatEffect: value =>
      `Each Reality simulates ${
        format(value, 2, 3)
      } additional Realities, giving all
      the same rewards as if it was amplified`,
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.ALTERNATION,
        amount: DC.D16,
      },
      {
        resource: ALCHEMY_RESOURCE.DECOHERENCE,
        amount: DC.D3,
      },
    ],
  },
  unpredictability: {
    id: ALCHEMY_RESOURCE.UNPREDICTABILITY,
    name: "Unpredictability",
    symbol: "Λ",
    isBaseResource: false,
    // Somewhat ugly number to make this show 70.00% at cap
    effect: amount => amount.div(amount.add(10714.28)),
    tier: 4,
    uiOrder: 4,
    unlockedAt: 21,
    description: "makes each Alchemy Reaction have a chance to happen twice",
    formatEffect: value =>
      `Any Alchemy Reaction has a ${formatPercents(value, 2, 2)}
      chance of triggering again`,
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.EFFARIG,
        amount: DC.D15,
      },
      {
        resource: ALCHEMY_RESOURCE.DECOHERENCE,
        amount: DC.D3,
      },
      {
        resource: ALCHEMY_RESOURCE.SYNERGISM,
        amount: DC.D10,
      },
    ],
  },

  // T5 (Reality)
  reality: {
    id: ALCHEMY_RESOURCE.REALITY,
    name: "Reality",
    symbol: "Ϟ",
    isBaseResource: false,
    effect: amount => Decimal.floor(amount),
    tier: 5,
    unlockedAt: 25,
    description: "can be consumed to create Reality Glyphs",
    formatEffect: value =>
      `Consume all Reality Resource to create a level ${
        formatInt(value)
      } Reality Glyph`,
    reagents: [
      {
        resource: ALCHEMY_RESOURCE.EXPONENTIAL,
        amount: DC.D1,
      },
      {
        resource: ALCHEMY_RESOURCE.FORCE,
        amount: DC.D1,
      },
      {
        resource: ALCHEMY_RESOURCE.UNCOUNTABILITY,
        amount: DC.D1,
      },
      {
        resource: ALCHEMY_RESOURCE.BOUNDLESS,
        amount: DC.D1,
      },
      {
        resource: ALCHEMY_RESOURCE.MULTIVERSAL,
        amount: DC.D1,
      },
      {
        resource: ALCHEMY_RESOURCE.UNPREDICTABILITY,
        amount: DC.D1,
      },
    ],
  },
};
