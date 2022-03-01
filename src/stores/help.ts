import { defineStore } from "pinia";
export const useHelpStore = defineStore("help", {
  state: () => ({
    visible: false,
  }),
  actions: {
    toggle() {
      this.visible = !this.visible;
    },

    show() {
      this.visible = true;
    },
  },
});
