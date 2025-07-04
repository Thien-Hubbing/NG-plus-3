<script>
import GlyphSetName from "@/components/GlyphSetName";
import GlyphShowcasePanelEntry from "@/components/modals/GlyphShowcasePanelEntry";
import ModalWrapper from "@/components/modals/ModalWrapper";

export default {
  name: "GlyphShowcasePanelModal",
  components: {
    GlyphSetName,
    ModalWrapper,
    GlyphShowcasePanelEntry,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    glyphSet: {
      type: Array,
      required: true,
    },
    isGlyphSelection: {
      type: Boolean,
      default: false,
    },
    showSetName: {
      type: Boolean,
      default: true,
    },
    displaySacrifice: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      glyphs: [],
      gainedLevel: new Decimal(),
      canSacrifice: false,
      realityGlyphBoost: new Decimal(),
    };
  },
  computed: {
    maxGlyphEffects() {
      let maxEffects = 1;
      for (const glyph of this.glyphs) {
        maxEffects = Math.max(getGlyphEffectsFromArray(glyph.effects).length, maxEffects);
      }
      return maxEffects;
    },
    containerClass() {
      return {
        "c-glyph-choice-container": true,
        "c-glyph-choice-container-single": this.glyphs.length === 1,
      };
    },
  },
  methods: {
    update() {
      this.glyphs = this.isGlyphSelection
        ? GlyphSelection.glyphList(GlyphSelection.choiceCount, gainedGlyphLevel(), { isChoosingGlyph: false })
        : this.glyphSet.filter(x => x);
      this.sortGlyphs();
      this.gainedLevel = gainedGlyphLevel().actualLevel;
      // There should only be one reality glyph; this picks one pseudo-randomly if multiple are cheated/glitched in
      const realityGlyph = this.glyphs.filter(g => g.type === "reality")[0];
      this.realityGlyphBoost = realityGlyph
        ? GlyphEffects.realityglyphlevel.effect(realityGlyph.level)
        : new Decimal();
    },
    sortGlyphs() {
      const standardOrder = ["reality", "effarig", "power", "infinity", "replication", "time", "dilation",
        "cursed", "companion"];
      this.glyphs.sort((a, b) => standardOrder.indexOf(a.type) - standardOrder.indexOf(b.type));
    },
  },
};
</script>

<template>
  <ModalWrapper>
    <template #header>
      {{ name }}
    </template>
    <div v-if="isGlyphSelection">
      Projected Glyph Level: {{ formatInt(gainedLevel) }}
    </div>
    <GlyphSetName
      v-if="showSetName"
      :glyph-set="glyphs"
      :force-color="true"
    />
    <div :class="containerClass">
      <GlyphShowcasePanelEntry
        v-for="(glyph, idx) in glyphs"
        :key="idx"
        class="c-glyph-choice-single-glyph"
        :idx="idx"
        :glyph="glyph"
        :show-level="!isGlyphSelection"
        :reality-glyph-boost="realityGlyphBoost"
        :max-glyph-effects="maxGlyphEffects"
        :show-sacrifice="displaySacrifice"
      />
    </div>
  </ModalWrapper>
</template>

<style scoped>
.c-glyph-choice-container {
  display: flex;
  flex-flow: row wrap;
  width: 74rem;
}

.c-glyph-choice-container-single {
  width: 37rem;
}

.c-glyph-choice-single-glyph {
  display: flex;
  flex-direction: row;
  width: 36rem;
  height: 12rem;
  justify-content: space-evenly;
  align-items: center;
  border-radius: var(--var-border-radius, 0.5rem);
  margin: 0.5rem;
}
</style>
