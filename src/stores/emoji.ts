import { defineStore } from "pinia";
import { EmojiButton } from "@joeattardi/emoji-button";
import { getNumber, hideMainUI, resetNumber } from "@/common/funcs";
import "@logseq/libs";

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
        const number = getNumber();
        resetNumber();
        const emojis = [...new Array(number)]
          .map(() => selection.emoji)
          .join("");
        await logseq.Editor.insertAtEditingCursor(emojis);
      });

      this.picker.on("hidden", async (selection) => {
        hideMainUI();
      });

      logseq.App.onThemeModeChanged(({ mode }) => {
        this.picker.setTheme(mode);
      });

      return this.picker;
    },
    async showPicker() {
      const { left, top, rect, pos } =
        await logseq.Editor.getEditingCursorPosition();
      Object.assign(this.emojiPickerEl.style, {
        position: "absolute",
        top: top + rect.top + "px",
        left: left + rect.left + "px",
      });

      setTimeout(() => {
        if (this.picker) {
          this.picker.showPicker(this.emojiPickerEl);
        }
      }, 100);
    },
    async initPicker() {
      this.emojiPickerEl = document.createElement("div");
      this.emojiPickerEl.classList.add("emoji-picker-trigger");
      document.getElementById("app").appendChild(this.emojiPickerEl);

      this.makePicker();
    },
  },
});
