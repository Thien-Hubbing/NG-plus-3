<script>
export default {
  name: "AutoSacrificeAdvancedTab",
  props: {
    glyphType: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      scoreThreshold: 0,
      effectScores: {},
    };
  },
  computed: {
    typeConfig() {
      return GlyphInfo[this.glyphType];
    },
    autoSacrificeSettings() {
      return AutoGlyphProcessor.types[this.glyphType];
    },
    effects() {
      return this.typeConfig.effects();
    },
    descStyle() {
      return {
        "color": GlyphAppearanceHandler.getBorderColor(this.glyphType),
        "border-color": this.typeConfig.color,
      };
    },
    minScoreInputStyle() {
      // Override some properties of the number input to match row style:
      return {
        "font-size": "larger",
        "border-width": "var(--var-border-width, 0.2rem)",
      };
    },
    questionmarkTooltip() {
      return "The score of a Glyph is its rarity percentage, plus the specified amount for each effect it has.";
    },
    // This is an absolute value limit (ie. it's allowed to go negative down to negative this value)
    weightInputLimit() {
      return 999;
    },
    superWeightInputLimit() {
      return 1e100;
    },
  },
  created() {
    this.effectScores = { ...AutoGlyphProcessor.types[this.glyphType].effectScores };
    console.log(AutoGlyphProcessor.types[this.glyphType]);
  },
  methods: {
    update() {
      this.scoreThreshold = this.autoSacrificeSettings.score;
      for (const e of this.typeConfig.effects()) {
        this.effectScores[e.id] = this.autoSacrificeSettings.effectScores[e.id];
      }
    },
    limitedInput(input) {
      return Math.clamp(input, -this.weightInputLimit, this.weightInputLimit);
    },
    setScoreThreshold(event) {
      const inputValue = event.target.value;
      if (!isNaN(inputValue)) {
        this.autoSacrificeSettings.score = this.limitedInput(inputValue);
      }
    },
    setEffectScore(index, event) {
      const inputValue = event.target.value;

      if (true || !isNaN(inputValue)) {
        this.autoSacrificeSettings.effectScores[index] = new Decimal(this.limitedInput(inputValue)).toNumber();
      }
    },
  },
};
</script>

<template>
  <div class="l-auto-sac-type-tab">
    <div class="l-auto-sac-type-tab__row-wrapper">
      <div>
        <div
          :ach-tooltip="questionmarkTooltip"
          class="o-questionmark"
        >
          ?
        </div>
        <b> Threshold score</b> (rarity % + effect scores)
      </div>
      <input
        ref="scoreThreshold"
        type="number"
        :min="-superWeightInputLimit"
        :max="superWeightInputLimit"
        class="c-auto-sac-type-tab__input"
        :value="scoreThreshold"
        :style="minScoreInputStyle"
        @blur="setScoreThreshold"
      >
    </div>
    <div
      v-for="effect in effects"
      :key="effect.id"
      class="l-auto-sac-type-tab__row-wrapper"
    >
      <div
        class="c-auto-sac-type-tab__effect-desc l-auto-sac-type-tab__effect-desc"
        :style="descStyle"
      >
        {{ effect.genericDesc }}
      </div>
      <input
        type="number"
        :min="-weightInputLimit"
        :max="weightInputLimit"
        class="c-auto-sac-type-tab__input"
        :value="effectScores[effect.id]"
        @blur="setEffectScore(effect.id, $event)"
      >
    </div>
  </div>
</template>

<style scoped>

</style>
