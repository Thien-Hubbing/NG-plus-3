<script>
import { GlyphInfo } from "../core/secret-formula/reality/core-glyph-info";

import GlyphComponent from "@/components/GlyphComponent";
import GlyphSetName from "@/components/GlyphSetName";

export default {
  name: "GlyphSetPreview",
  components: {
    GlyphComponent,
    GlyphSetName,
  },
  props: {
    text: {
      type: String,
      required: false,
      default: "",
    },
    textHidden: {
      type: Boolean,
      required: false,
      default: false,
    },
    glyphs: {
      type: Array,
      required: true,
    },
    ignoreModifiedLevel: {
      type: Boolean,
      required: false,
      default: false,
    },
    flipTooltip: {
      type: Boolean,
      required: false,
      default: false,
    },
    isInModal: {
      type: Boolean,
      required: false,
      default: false,
    },
    showName: {
      type: Boolean,
      required: false,
      default: true,
    },
    forceNameColor: {
      type: Boolean,
      required: false,
      default: true,
    },
    showSacrifice: {
      type: Boolean,
      required: false,
      default: false,
    },
    noneText: {
      type: String,
      required: false,
      default: "(No Glyphs equipped)",
    },
    sort: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      realityGlyphBoost: new Decimal(),
    };
  },
  computed: {
    orderedGlyphs() {
      if (!this.sort) {
        return this.glyphs;
      }
      const standardOrder = GlyphInfo.glyphTypes;
      const order = Glyphs.copyForRecords(this.glyphs);
      // Technically doesn't stable sort between glyphs of the same type, probably fine though
      order.sort((a, b) => standardOrder.indexOf(a.type) - standardOrder.indexOf(b.type));
      return order;
    },
  },
  watch: {
    glyphs() {
      this.$recompute("orderedGlyphs");
    },
  },
  methods: {
    update() {
      // Handle multiple reality glyphs
      const realityGlyphs = this.glyphs.filter(g => g?.type === "reality");
      if (realityGlyphs.length > 0) {
        this.realityGlyphBoost = realityGlyphs.reduce((a, b) => a.add(GlyphEffects.realityglyphlevel.effect(b.level)));
      } else {
        this.realityGlyphBoost = new Decimal();
      }
    },
    showModal() {
      if (this.isInModal) {
        return;
      }
      Modal.glyphShowcasePanel.show({
        name: this.text,
        glyphSet: this.glyphs,
        closeEvent: GAME_EVENT.GLYPH_SET_SAVE_CHANGE,
        displaySacrifice: this.showSacrifice,
      });
    },
    // Necessary to force a re-render for the set name if the set itself changes
    glyphIds() {
      return this.glyphs.map(x => x.id).reduce(Number.sumReducer);
    },
  },
};
</script>

<template>
  <div>
    <span v-if="text && !textHidden">
      {{ text }}
      <br>
    </span>
    <span
      v-if="glyphs.length !== 0"
      :class="{ 'l-glyph-set-preview': !isInModal}"
      @click="showModal"
    >
      <GlyphSetName
        v-if="showName"
        :key="glyphIds()"
        :glyph-set="glyphs"
        :force-color="forceNameColor"
      />
      <GlyphComponent
        v-for="(g, idx) in orderedGlyphs"
        :key="idx"
        class="l-preview"
        :glyph="g"
        :show-sacrifice="showSacrifice"
        :draggable="false"
        :circular="true"
        :ignore-modified-level="ignoreModifiedLevel"
        :reality-glyph-boost="realityGlyphBoost"
        :flip-tooltip="flipTooltip"
        :is-in-modal="isInModal"
        size="3rem"
        :text-proportion="0.5"
        glow-blur="0.2rem"
        glow-spread="0.1rem"
      />
    </span>
    <span v-else>
      <GlyphSetName
        v-if="showName"
        :glyph-set="glyphs"
        :force-color="forceNameColor"
      />
      {{ noneText }}
    </span>
  </div>
</template>

<style scoped>
.l-preview {
  margin: 0.2rem;
}
</style>
