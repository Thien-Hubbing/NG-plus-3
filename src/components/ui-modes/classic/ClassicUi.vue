<script>
import { defineComponent } from "vue";
import BigCrunchButton from "../BigCrunchButton.vue";
import GameHeader from "../GameHeader.vue";
import NewsTicker from "../NewsTicker.vue";

import ClassicSubtabBar from "./ClassicSubtabBar.vue";
import ClassicTabBar from "./ClassicTabBar.vue";
import EternityPointsHeader from "@/components/EternityPointsHeader.vue";
import InfinityPointsHeader from "@/components/InfinityPointsHeader.vue";

export default defineComponent({
  name: "ClassicUi",
  components: {
    GameHeader,
    ClassicSubtabBar,
    ClassicTabBar,
    NewsTicker,
    InfinityPointsHeader,
    EternityPointsHeader,
    BigCrunchButton,
  },
  data() {
    return {
      bigCrunch: false,
      smallCrunch: false,
      newGameKey: "",
    };
  },
  computed: {
    tab: () => Tabs.current,
    news() {
      return this.$viewModel.news;
    },
  },
  methods: {
    update() {
      const crunchButtonVisible = !player.break && Player.canCrunch;
      this.bigCrunch = crunchButtonVisible && Time.bestInfinityRealTime.totalMinutes.gt(1);
      // This only exists to force a key-swap after pressing the button to start a new game; the news ticker can break
      // if it isn't redrawn
      this.newGameKey = Pelle.isDoomed;
    },
  },
});
</script>

<template>
  <div
    id="container"
    :key="newGameKey"
    class="container c-old-ui l-old-ui"
  >
    <link
      rel="stylesheet"
      type="text/css"
      href="styles/old-ui.css"
    >
    <BigCrunchButton />
    <template v-if="!bigCrunch">
      <NewsTicker
        v-if="news"
        class="l-old-ui__news-bar"
      />
      <GameHeader class="l-old-ui__header" />
      <ClassicTabBar />
      <component
        :is="tab.config.before"
        v-if="tab.config.before"
      />
      <ClassicSubtabBar />
      <div class="l-old-ui__page">
        <slot />
      </div>
    </template>
  </div>
</template>

<style scoped>

</style>
