<script>
import CostDisplay from "@/components/CostDisplay";
import CustomizeableTooltip from "@/components/CustomizeableTooltip";
import DescriptionDisplay from "@/components/DescriptionDisplay";
import EffectDisplay from "@/components/EffectDisplay";
import PrimaryToggleButton from "@/components/PrimaryToggleButton";

export default {
  name: "DilationUpgradeButton",
  components: {
    PrimaryToggleButton,
    DescriptionDisplay,
    EffectDisplay,
    CostDisplay,
    CustomizeableTooltip,
  },
  props: {
    upgrade: {
      type: Object,
      required: true,
    },
    isRebuyable: {
      type: Boolean,
      required: false,
      default: false,
    },
    showTooltip: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      isBought: false,
      isCapped: false,
      isAffordable: false,
      isAutoUnlocked: false,
      isAutobuyerOn: false,
      boughtAmount: new Decimal(),
      currentDT: new Decimal(0),
      currentDTGain: new Decimal(0),
      timeEstimate: "",
      isHovering: false,
      hideEstimate: false,
    };
  },
  computed: {
    classObject() {
      if (this.isUseless) {
        // A lot of people did not understand the old way of handling TP mult (3) so we now permanently disable it
        // and adjust the rift formula to come up for the lack of purchasable upgrade. Therefore we mark both upgrades
        // similar to the rest of the game - as strictly disabled.
        return {
          "o-dilation-upgrade o-pelle-disabled-pointer": true,
          "o-pelle-disabled o-dilation-upgrade--useless": this.upgrade.id === 7 || this.upgrade.id === 3,
        };
      }
      return {
        "o-dilation-upgrade": true,
        "o-dilation-upgrade--rebuyable": this.isRebuyable,
        "o-dilation-upgrade--available": !this.isBought && !this.isCapped && this.isAffordable,
        "o-dilation-upgrade--unavailable": !this.isBought && !this.isCapped && !this.isAffordable,
        "o-dilation-upgrade--bought": this.isBought,
        "o-dilation-upgrade--capped": this.isCapped,
      };
    },
    isUseless() {
      const tpip = this.upgrade.id === 3 || this.upgrade.id === 7;
      return Pelle.isDoomed && tpip;
    },
  },
  watch: {
    isAutobuyerOn(newValue) {
      Autobuyer.dilationUpgrade(this.upgrade.id).isActive = newValue;
    },
  },
  methods: {
    update() {
      const upgrade = this.upgrade;
      this.currentDT.copyFrom(Currency.dilatedTime.value);
      this.currentDTGain.copyFrom(getDilationGainPerSecond());
      this.hideEstimate = this.isAffordable || this.isCapped || this.upgrade.isBought || this.isUseless;
      this.timeEstimate = this.hideEstimate ? null : getDilationTimeEstimate(this.upgrade.cost);
      if (this.isRebuyable) {
        this.isAffordable = upgrade.isAffordable;
        this.isCapped = upgrade.isCapped;
        const autobuyer = Autobuyer.dilationUpgrade(upgrade.id);
        this.boughtAmount.copyFrom(upgrade.boughtAmount);
        if (!autobuyer) {
          return;
        }
        this.isAutoUnlocked = autobuyer.isUnlocked;
        this.isAutobuyerOn = autobuyer.isActive;
        return;
      }
      this.isBought = upgrade.isBought;
      if (!this.isBought) {
        this.isAffordable = upgrade.isAffordable;
      }
    },
  },
};
</script>

<template>
  <div class="l-spoon-btn-group">
    <button
      :ach-tooltip="timeEstimate"
      :class="classObject"
      @click="upgrade.purchase()"
      @mouseover="isHovering = true"
      @mouseleave="isHovering = false"
    >
      <CustomizeableTooltip
        v-if="timeEstimate"
        :show="showTooltip && !isHovering && !hideEstimate"
        left="50%"
        top="0"
      >
        <template #tooltipContent>
          {{ timeEstimate }}
        </template>
      </CustomizeableTooltip>
      <span>
        <DescriptionDisplay
          :config="upgrade.config"
          :length="70"
          name="o-dilation-upgrade__description"
        />
        <EffectDisplay
          :key="boughtAmount.toNumber()"
          br
          :config="upgrade.config"
        />
      </span>
      <CostDisplay
        v-if="!isBought && !isCapped"
        br
        :config="upgrade.config"
        name="Dilated Time"
      />
    </button>
    <PrimaryToggleButton
      v-if="isRebuyable && isAutoUnlocked"
      v-model="isAutobuyerOn"
      label="Auto:"
      class="l--spoon-btn-group__little-spoon o-primary-btn--dilation-upgrade-toggle"
    />
  </div>
</template>

<style scoped>
.o-dilation-upgrade {
  width: 19rem;
  height: 9rem;
  font-family: Typewriter, serif;
  font-size: 1rem;
  font-weight: bold;
  background: black;
  border: 0.1rem solid;
  border-radius: var(--var-border-radius, 0.4rem);
  transition-duration: 0.2s;
}

.o-dilation-upgrade--available {
  color: var(--color-dilation);
  border-color: var(--color-dilation);
  animation: a-dilation-btn-glow 10s infinite;
  cursor: pointer;
}

.o-dilation-upgrade--rebuyable.o-dilation-upgrade--available {
  color: #64ddad;
  border-color: #64ddad;
}

.o-dilation-upgrade--available:hover {
  background-color: white;
}

.o-dilation-upgrade--bought,
.o-dilation-upgrade--capped {
  color: black;
  background-color: var(--color-dilation);
  border-color: black;
}

.o-dilation-upgrade--useless {
  color: black;
  background-color: var(--color-pelle--base);
  filter: grayscale(50%);
}

.o-dilation-upgrade--unavailable {
  color: #181818;
  background-color: #5f5f5f;
  border-color: #3e8a0f;
}

.o-dilation-upgrade--rebuyable.o-dilation-upgrade--unavailable {
  border-color: #64ddad;
}

.o-dilation-upgrade--unavailable:hover {
  color: #1d1d1d;
  background-color: #660000;
}

.o-dilation-upgrade__description--small-text {
  font-size: 0.95rem;
}

.s-base--metro .o-dilation-upgrade--unavailable,
.t-s1 .o-dilation-upgrade--unavailable {
  color: black;
  background-color: #9e9e9e;
  border: none;
  box-shadow: 0.1rem 0.1rem 0.1rem 0 black;
}

.s-base--metro .o-dilation-upgrade--unavailable:hover {
  background-color: #ef5350;
}

.t-s1 .o-dilation-upgrade--unavailable:hover {
  background-color: #d72621;
}

.t-dark .o-dilation-upgrade--available:hover,
.t-s6 .o-dilation-upgrade--available:hover,
.t-s10 .o-dilation-upgrade--available:hover {
  color: var(--color-dilation);
  background-color: white;
}

.t-dark .o-dilation-upgrade--rebuyable.o-dilation-upgrade--available:hover,
.t-s6 .o-dilation-upgrade--rebuyable.o-dilation-upgrade--available:hover,
.t-s10 .o-dilation-upgrade--rebuyable.o-dilation-upgrade--available:hover {
  color: #64ddad;
}

.t-dark .o-dilation-upgrade--bought,
.t-dark .o-dilation-upgrade--capped {
  background-color: var(--color-dilation);
}

.t-s6 .o-dilation-upgrade--unavailable,
.t-s10 .o-dilation-upgrade--unavailable {
  color: gray;
  background-color: black;
}

.t-dark .o-dilation-upgrade--unavailable {
  color: black;
  background-color: #23292a;
}

.t-dark .o-dilation-upgrade--unavailable:hover,
.t-s6 .o-dilation-upgrade--unavailable:hover,
.t-s10 .o-dilation-upgrade--unavailable:hover {
  color: black;
  background-color: var(--color-bad);
  border-color: var(--color-bad);
}

.t-s4 .o-dilation-upgrade--available {
  animation: a-dilation-btn-glow--cancer 10s infinite;
}

.t-s6 .o-dilation-upgrade--bought,
.t-s6 .o-dilation-upgrade--capped,
.t-s10 .o-dilation-upgrade--bought,
.t-s10 .o-dilation-upgrade--capped {
  background: var(--color-dilation);
}
</style>
