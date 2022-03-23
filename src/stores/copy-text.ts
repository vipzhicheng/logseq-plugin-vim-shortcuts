import { defineStore } from "pinia";
import "@logseq/libs";

export const useCopyTextStore = defineStore("copy-text", {
  state: () => ({
    visible: false,
    title: "Copy Text",
    width: "50%",
    content: "",
  }),
  actions: {
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    setTitle(title: string) {
      this.title = title;
    },
    setWidth(width: string) {
      this.width = width;
    },
    setContent(content: string) {
      this.content = content;
    },
  },
});
