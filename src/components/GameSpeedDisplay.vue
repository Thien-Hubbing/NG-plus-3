<script>
export default {
  name: "GameSpeedDisplay",
  props: {},
  data() {
    return {
      baseSpeed: new Decimal(),
      pulsedSpeed: new Decimal(),
      hasSeenAlteredSpeed: false,
      isStopped: false,
      isEC12: false,
      isPulsing: false,
    };
  },
  computed: {
    baseSpeedText() {
      if (this.isStopped) {
        return "Stopped (storing real time)";
      }
      const speed = this.formatNumber(this.baseSpeed);
      if (this.isEC12) {
        return `${speed} (fixed)`;
      }
      return `${speed}`;
    },
    pulseSpeedText() {
      return `${this.formatNumber(this.pulsedSpeed)}`;
    },
    baseText() {
      if (!this.hasSeenAlteredSpeed) {
        return null;
      }
      return this.baseSpeed.eq(1)
        ? "The game is running at normal speed."
        : `Game speed is altered: ${this.baseSpeedText}`;
    },
  },
  methods: {
    update() {
      this.baseSpeed = getGameSpeedupFactor();
      this.pulsedSpeed = getGameSpeedupForDisplay();
      this.hasSeenAlteredSpeed = PlayerProgress.seenAlteredSpeed();
      this.isStopped = Enslaved.isStoringRealTime;
      this.isEC12 = EternityChallenge(12).isRunning;
      this.isPulsing = this.baseSpeed.neq(this.pulsedSpeed) && Enslaved.canRelease(true);
    },
    formatNumber(num) {
      if (num.gte(0.001) && num.lt(1e4) && num.neq(1)) {
        return format(num, 3, 3);
      }
      if (num.lt(0.001)) {
        return `${formatInt(1)} / ${format(Decimal.div(1, num), 2)}`;
      }
      return `${format(num, 2)}`;
    },
  },
};
</script>

<template>
  <span class="c-gamespeed">
    <span>
      {{ baseText }}
    </span>
    <span v-if="isPulsing">(<i class="fas fa-expand-arrows-alt u-fa-padding" /> {{ pulseSpeedText }})</span>
  </span>
</template>

<style scoped>
.c-gamespeed {
  font-weight: bold;
  color: var(--color-text);
}
</style>
