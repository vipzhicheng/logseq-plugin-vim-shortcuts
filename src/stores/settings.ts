import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const visible = ref(false);
  const activeTab = ref('keybindings');

  const show = () => {
    visible.value = true;
  };

  const hide = () => {
    visible.value = false;
  };

  const setActiveTab = (tab: string) => {
    activeTab.value = tab;
  };

  return {
    visible,
    activeTab,
    show,
    hide,
    setActiveTab,
  };
});
