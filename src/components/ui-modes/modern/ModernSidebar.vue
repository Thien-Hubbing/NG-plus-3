<script>
import { defineComponent } from "vue";
import ModernSidebarCurrency from "./ModernSidebarCurrency.vue";
import ModernTabButton from "./ModernTabButton.vue";

export default defineComponent({
  name: "ModernSidebar",
  components: {
    ModernSidebarCurrency,
    ModernTabButton,
  },
  data() {
    return {
      isHidden: false,
      tabVisibilities: [],
    };
  },
  computed: {
    tabs: () => Tabs.newUI,
  },
  methods: {
    update() {
      this.isHidden = AutomatorData.isEditorFullscreen;
      this.tabVisibilities = [true, true, true, true, true, true, true, true, true, true, true, true];
    },
  },
});
</script>

<template>
  <div
    v-if="!isHidden"
    class="c-modern-sidebar"
  >
    <ModernSidebarCurrency />
    <template
      v-for="(tab, tabPosition) in tabs"
    >
      <ModernTabButton
        v-if="tabVisibilities[tabPosition]"
        :key="tab.name"
        :tab="tab"
        :tab-position="tabPosition"
      />
    </template>
  </div>
</template>

<style scoped>

</style>
