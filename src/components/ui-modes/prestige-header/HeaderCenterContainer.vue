<script>
import ArmageddonButton from "../../tabs/celestial-pelle/ArmageddonButton.vue";
import RealityCurrencyHeader from "../../RealityCurrencyHeader.vue";

import HeaderTickspeedInfo from "../HeaderTickspeedInfo.vue";

import RealityButton from "./RealityButton.vue";
import { defineComponent } from "vue";

// This component contains antimatter and antimatter rate at the start of the game, as well as some additional
// information depending on the UI (tickspeed for Classic, game speed for Modern). Everything but antimatter is
// removed once Reality is unlocked, to make room for the reality button
export default defineComponent({
  name: "HeaderCenterContainer",
  components: {
    HeaderTickspeedInfo,
    RealityCurrencyHeader,
    RealityButton,
    ArmageddonButton,
  },
  data() {
    return {
      shouldDisplay: true,
      isModern: false,
      hasRealityButton: false,
      isDoomed: false,
      antimatter: new Decimal(0),
      antimatterPerSec: new Decimal(0),
    };
  },
  methods: {
    update() {
      this.shouldDisplay = player.break || !Player.canCrunch;
      if (!this.shouldDisplay) {
        return;
      }

      this.isModern = player.options.newUI;
      this.isDoomed = Pelle.isDoomed;
      this.antimatter.copyFrom(Currency.antimatter);
      this.hasRealityButton = isRealityAvailable();
      if (!this.hasRealityButton) {
        this.antimatterPerSec.copyFrom(Currency.antimatter.productionPerSecond);
      }
    },
  },
});
</script>

<template>
  <div
    v-if="shouldDisplay"
    class="c-prestige-button-container"
  >
    <span>You have <span class="c-game-header__antimatter">{{ format(antimatter, 2) }}</span> antimatter {{ formatGain(antimatter, antimatterPerSec, 2, 2) }}</span>
    <div
      v-if="hasRealityButton"
      class="c-reality-container"
    >
      <RealityCurrencyHeader />
      <ArmageddonButton
        v-if="isDoomed"
        :is-header="true"
      />
      <RealityButton v-else />
    </div>
    <div v-else>
      You are getting {{ format(antimatterPerSec, 2) }} antimatter per second.
      <br>
      <HeaderTickspeedInfo />
    </div>
  </div>
</template>

<style scoped>
.c-reality-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
</style>
