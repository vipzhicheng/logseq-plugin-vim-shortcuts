import { defineStore } from "pinia";
export const commandList = [
  {
    value: "s/",
    desc: "Replace current block according regex.",
    wait: true,
  },
  {
    value: "substitute/",
    desc: "Replace current block according regex.",
    wait: true,
  },
  {
    value: "%s/",
    desc: "Replace current page blocks according regex.",
    wait: true,
  },
  {
    value: "%substitute/",
    desc: "Replace current page blocks according regex.",
    wait: true,
  },
  { value: "m", desc: "Go to marked page or block.", wait: true },
  { value: "mark", desc: "Go to marked page or block.", wait: true },
  { value: "marks", desc: "Show marks." },
  { value: "delm", desc: "Delete specific marks.", wait: true },
  { value: "delmarks", desc: "Delete specific marks.", wait: true },
  { value: "delm!", desc: "Delete all marks.", wait: false },
  { value: "delmarks!", desc: "Delete all marks.", wait: false },
  { value: "w", desc: "Save current page." },
  { value: "write", desc: "Save current page." },
  { value: "wq", desc: "Save current page and quit vim command mode." },
  { value: "q", desc: "Quit vim command mode." },
  { value: "quit", desc: "Quit vim command mode." },
  { value: "re", desc: "Rename current page.", wait: true },
  { value: "rename", desc: "Rename current page.", wait: true },
  { value: "undo", desc: "Undo last edit.", wait: false },
  { value: "redo", desc: "Redo last edit.", wait: false },
  { value: "lorem", desc: "Random generate blocks.", wait: true },
  {
    value: "emoji-picker",
    desc: "Search and input emojis using emoji picker.",
    wait: false,
  },
  { value: "emoji", desc: "Search and input emojis.", wait: true },
  { value: "sort", desc: "Sort blocks a-z.", wait: false },
  { value: "rsort", desc: "Sort blocks z-a.", wait: false },
  {
    value: "bg-picker",
    desc: "Set block backgroud color using color picker.",
    wait: false,
  },
  { value: "bg", desc: "Set block backgroud color.", wait: true },
  { value: "bg-clear", desc: "Clear block backgroud color.", wait: false },
  {
    value: "bg-random",
    desc: "Set block backgroud color randomly.",
    wait: false,
  },
  {
    value: "copy-path",
    desc: "Copy page or journal path for editing it in other editor.",
  },
  {
    value: "open-in-vscode",
    desc: "Open page in VSCode.",
  },
  {
    value: "go ",
    desc: "go to existed page.",
    wait: true,
  },
  {
    value: "go! ",
    desc: "Create new page or go to existed page.",
    wait: true,
  },
  {
    value: "clear-highlights",
    desc: "Clear all blocks highlight on current page.",
    wait: false,
  },
  {
    value: "h",
    desc: "Show help modal.",
    wait: false,
  },
  {
    value: "help",
    desc: "Show help modal.",
    wait: false,
  },
];
export const useCommandStore = defineStore("command", {
  state: () => ({
    commandList,
    triggerOnFocus: false,
    input: "",
    visible: false,
  }),
  actions: {
    show() {
      this.input = "";
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    setVisible(visible) {
      this.visible = visible;
    },
    getCommandList() {
      return this.commandList;
    },
    enableTriggerOnFocus() {
      this.triggerOnFocus = true;
    },
    disableTriggerOnFocus() {
      this.triggerOnFocus = true;
    },
    emptyInput() {
      this.input = "";
    },
    setInput(input) {
      this.input = input;
    },
  },
});
