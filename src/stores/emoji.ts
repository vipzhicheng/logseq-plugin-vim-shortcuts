import { defineStore } from "pinia";
import { EmojiButton } from "@joeattardi/emoji-button";
import { hideMainUI } from "@/common/funcs";

export const useEmojiStore = defineStore("emoji", {
  state: () => ({
    picker: null,
    emojiPickerEl: null,
  }),
  actions: {
    async makePicker() {
      if (this.picker) return this.picker;

      const appUserConfig = await logseq.App.getUserConfigs();
      this.picker = new EmojiButton({
        position: "bottom-start",
        theme: appUserConfig.preferredThemeMode,
      });

      this.picker.on("emoji", async (selection) => {
        await logseq.Editor.insertAtEditingCursor(selection.emoji);
      });

      this.picker.on("hidden", async (selection) => {
        hideMainUI();
      });

      logseq.App.onThemeModeChanged(({ mode }) => {
        this.picker.setTheme(mode);
      });

      return this.picker;
    },
    async init() {
      this.emojiPickerEl = document.createElement("div");
      this.emojiPickerEl.classList.add("emoji-picker-trigger");
      document.getElementById("app").appendChild(this.emojiPickerEl);

      this.makePicker();
    },
  },
});
