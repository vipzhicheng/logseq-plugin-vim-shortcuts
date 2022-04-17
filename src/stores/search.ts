import { defineStore } from "pinia";
export const useSearchStore = defineStore("search", {
  state: () => ({
    visible: false,
    input: "",
  }),
  actions: {
    toggle() {
      this.visible = !this.visible;
    },

    show() {
      this.visible = true;
    },

    hide() {
      this.visible = false;
    },

    emptyInput() {
      this.input = "";
    },
  },
});
