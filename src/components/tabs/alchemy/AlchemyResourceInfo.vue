<script>
import EffectDisplay from "@/components/EffectDisplay";

export default {
  name: "AlchemyResourceInfo",
  components: {
    EffectDisplay,
  },
  props: {
    resource: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      amount: new Decimal(),
      cap: new Decimal(),
      capped: false,
      flow: new Decimal(),
      isReactionActive: false,
      reactionProduction: new Decimal(),
      isUnlocked: false,
      unlockRequirement: "",
    };
  },
  computed: {
    classObject() {
      return {
        "c-alchemy-resource-info": true,
        "c-alchemy-resource-info--locked": !this.isUnlocked,
      };
    },
    reaction() {
      return this.resource.reaction;
    },
    isBaseResource() {
      return this.resource.isBaseResource;
    },
    reactionText() {
      if (this.resource === AlchemyResource.reality) {
        return this.realityReactionText;
      }
      const reagents = this.reaction.reagents
        .map(r => `${format(r.cost)}${r.resource.symbol}`)
        .join(" + ");
      return `${reagents} ➜ ${format(this.reactionProduction, 2, 2)}${this.resource.symbol}`;
    },
    realityReactionText() {
      const reagents = this.reaction.reagents
        .map(r => r.resource.symbol)
        .join(" + ");
      return `${reagents} ➜ ${this.resource.symbol}`;
    },
    effectConfig() {
      const resource = this.resource;
      return {
        effect: () => resource.effectValue,
        formatEffect: resource.config.formatEffect,
      };
    },
    resourceAmount() {
      return formatFloat(this.amount, 1);
    },
    resourceCap() {
      return formatFloat(this.cap, 1);
    },
    formattedFlow() {
      const sign = this.flow.gte(0) ? "+" : "-";
      if (Decimal.abs(this.flow).lt(0.01)) {
        return "None";
      }
      const resourceText = `${sign}${format(Decimal.abs(this.flow), 2, 2)}/sec`;
      const color = this.flow.gt(0) ? "9CCC65" : "CC6666";
      return `<span style="color:#${color}">${resourceText}</span>`;
    },
    isDoomed: () => Pelle.isDoomed,
  },
  methods: {
    update() {
      const resource = this.resource;
      this.amount.copyFrom(resource.amount);
      this.cap.copyFrom(resource.cap);
      this.capped = resource.capped;
      this.flow.copyFrom(new Decimal(resource.flow));
      this.isUnlocked = resource.isUnlocked;
      this.unlockRequirement = resource.lockText;
      if (!this.isBaseResource) {
        this.isReactionActive = !this.isDoomed && this.reaction.isActive;
        this.reactionProduction.copyFrom(this.reaction.reactionProduction);
      }
    },
  },
};
</script>

<template>
  <div
    v-if="isUnlocked"
    :class="classObject"
  >
    <span class="c-alchemy-resource-info__title">
      {{ resource.symbol }} {{ resource.name }} {{ resource.symbol }}
    </span>
    <span v-if="isDoomed">
      Destroyed by Pelle
    </span>
    <span v-else>
      {{ capped ? "Capped" : "Current" }}: {{ resourceAmount }}/{{ resourceCap }}
      (Recent change: <span v-html="formattedFlow" />)
    </span>
    <span v-if="isBaseResource">Base Resource</span>
    <span v-else>Reaction: {{ isReactionActive ? "Active" : "Inactive" }} ({{ reactionText }})</span>
    <span :class="{ 'o-pelle-disabled': isDoomed }">
      <EffectDisplay
        label="Effect"
        :config="effectConfig"
      />
    </span>
  </div>
  <div
    v-else
    :class="classObject"
  >
    Unlock requirement: {{ unlockRequirement }}
  </div>
</template>

<style scoped>

</style>
