<script>
import PrimaryButton from "@/components/PrimaryButton";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ClassicAntimatterGalaxyRow",
  components: {
    PrimaryButton,
  },
  data() {
    return {
      type: GALAXY_TYPE.NORMAL,
      galaxies: {
        normal: new Decimal(),
        replicanti: new Decimal(),
        dilation: new Decimal(),
      },
      requirement: {
        tier: 1,
        amount: new Decimal(),
      },
      canBeBought: false,
      lockText: null,
      canBulkBuy: false,
      creditsClosed: false,
      scalingStart: {
        distant: new Decimal(0),
        remote: new Decimal(0),
        obscure: new Decimal(0),
        invisible: new Decimal(0),
        ethereal: new Decimal(0),
      },
      hasTutorial: false,
    };
  },
  computed: {
    isDoomed: () => Pelle.isDoomed,
    dimName() {
      return AntimatterDimension(this.requirement.tier).displayName;
    },
    buttonText() {
      if (this.lockText !== null) {
        return this.lockText;
      }
      const reset = [];
      if (!Achievement(111).isUnlocked && !EternityMilestone.noADReset.isReached) {
        reset.push("Dimensions");
      }
      if (!Achievement(143).isUnlocked && !EternityMilestone.noADReset.isReached) {
        reset.push("Dimension Boosts");
      }
      return reset.length === 0
        ? "Increase the power of Tickspeed upgrades"
        : `Reset your ${makeEnumeration(reset)} to increase the power of Tickspeed upgrades`;
    },
    sumText() {
      const parts = [Decimal.max(this.galaxies.normal, 0)];
      if (this.galaxies.replicanti.gt(0)) {
        parts.push(this.galaxies.replicanti);
      }
      if (this.galaxies.dilation.gt(0)) {
        parts.push(this.galaxies.dilation);
      }
      const sum = parts.map(this.formatGalaxies).join(" + ");
      if (parts.length >= 2) {
        return `${sum} = ${this.formatGalaxies(parts.sum())}`;
      }
      return sum;
    },
    typeName() {
      switch (this.type) {
        case GALAXY_TYPE.NORMAL: {
          return "Antimatter Galaxies";
        }
        case GALAXY_TYPE.DISTANT: {
          return "Distant Antimatter Galaxies";
        }
        case GALAXY_TYPE.REMOTE: {
          return "Remote Antimatter Galaxies";
        }
        case GALAXY_TYPE.OBSCURE: {
          return "Obscure Antimatter Galaxies";
        }
        case GALAXY_TYPE.INVISIBLE: {
          return "Invisible Antimatter Galaxies";
        }
        case GALAXY_TYPE.ETHEREAL: {
          return "Ethereal Antimatter Galaxies";
        }
      }
      return "Antimatter Galaxies";
    },
    hasIncreasedScaling() {
      return this.type !== GALAXY_TYPE.NORMAL;
    },
    costScalingText() {
      if (this.type === GALAXY_TYPE.NORMAL) {
        return;
      }

      if (this.type === GALAXY_TYPE.DISTANT) {
        return `Each Galaxy is more expensive past ${quantifyInt("Galaxy", this.scalingStart.distant)}`;
      }

      const scalings = [
        { type: "distant", function: "quadratic", amount: this.scalingStart.distant },
        { type: "remote", function: "exponential", amount: this.scalingStart.remote },
      ];

      if (this.type === GALAXY_TYPE.OBSCURE) {
        scalings.push({ type: "obscure", function: "polynomial", amount: this.scalingStart.obscure });
      }
      if (this.type === GALAXY_TYPE.INVISIBLE) {
        scalings.push({ type: "invisible", function: "dilative", amount: this.scalingStart.invisible });
      }
      if (this.type === GALAXY_TYPE.ETHEREAL) {
        scalings.push({ type: "ethereal", function: "exponential", amount: this.scalingStart.ethereal });
      }

      return `Increased Galaxy cost scaling: ${scalings.sort((a, b) => a.amount.compare(b.amount))
        .map(scaling => `${scaling.function} scaling past ${this.formatGalaxies(scaling.amount)} (${scaling.type})`)
        .join(", ").capitalize()}`;
    },
    classObject() {
      return {
        "o-primary-btn--galaxy l-dim-row__prestige-button": true,
        "tutorial--glow": this.canBeBought && this.hasTutorial,
        "o-pelle-disabled-pointer": this.creditsClosed,
      };
    },
  },
  methods: {
    update() {
      this.type = Galaxy.type;
      this.scalingStart.distant.copyFrom(Galaxy.scalingStart[GALAXY_TYPE.DISTANT]);
      this.scalingStart.remote.copyFrom(Galaxy.scalingStart[GALAXY_TYPE.REMOTE]);
      this.scalingStart.obscure.copyFrom(Galaxy.scalingStart[GALAXY_TYPE.OBSCURE]);
      this.scalingStart.invisible.copyFrom(Galaxy.scalingStart[GALAXY_TYPE.INVISIBLE]);
      this.scalingStart.ethereal.copyFrom(Galaxy.scalingStart[GALAXY_TYPE.ETHEREAL]);

      this.galaxies.normal.copyFrom(player.galaxies.add(GalaxyGenerator.galaxies));
      this.galaxies.replicanti.copyFrom(Replicanti.galaxies.total);
      this.galaxies.dilation.copyFrom(player.dilation.totalTachyonGalaxies);
      const requirement = Galaxy.requirement;
      this.requirement.amount.copyFrom(requirement.amount);
      this.requirement.tier = requirement.tier;
      this.canBeBought = requirement.isSatisfied && Galaxy.canBeBought;

      this.lockText = Galaxy.lockText;
      this.canBulkBuy = EternityMilestone.autobuyMaxGalaxies.isReached;
      this.creditsClosed = GameEnd.creditsEverClosed;
      this.hasTutorial = Tutorial.isActive(TUTORIAL_STATE.GALAXY);
    },
    buyGalaxy(bulk) {
      if (!this.canBeBought) {
        return;
      }
      manualRequestGalaxyReset(this.canBulkBuy && bulk);
    },
    formatGalaxies(num) {
      return num.gt(1e8) ? format(num, 2) : formatInt(num);
    },
  },
});
</script>

<template>
  <div class="c-dimension-row c-antimatter-dim-row c-antimatter-prestige-row">
    <div
      class="l-dim-row__prestige-text c-dim-row__label c-dim-row__label--amount l-text-wrapper"
    >
      {{ typeName }} ({{ sumText }}):
      requires {{ formatInt(requirement.amount) }} {{ dimName }} Dimensions
      <div class="l-scaling-text-wrapper">
        {{ hasIncreasedScaling ? costScalingText : "" }}
      </div>
    </div>
    <PrimaryButton
      :enabled="canBeBought"
      :class="classObject"
      @click.exact="buyGalaxy(true)"
      @click.shift.exact="buyGalaxy(false)"
    >
      {{ buttonText }}
      <div
        v-if="hasTutorial"
        class="fas fa-circle-exclamation l-notification-icon"
      />
    </PrimaryButton>
  </div>
</template>

<style scoped>
.l-text-wrapper {
  height: 6rem;
}

.l-scaling-text-wrapper {
  height: 2rem;
  font-size: 1.2rem;
}

.o-primary-btn--galaxy {
  width: 22rem;
  height: 5.5rem;
  position: relative;
  font-size: 0.9rem;
}
</style>
