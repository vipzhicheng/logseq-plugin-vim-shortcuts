import "@logseq/libs";
import "./style.css";

import { createApp } from "vue";
import App from "./App.vue";

import {
  initSettings,
  loadMarks,
  setHotkeys,
  getCommandFromHistoryBack,
  getCommandFromHistoryForward,
  hideMainUI,
} from "./common/funcs";
import bottom from "./keybindings/bottom";
import changeCase from "./keybindings/changeCase";
import changeCaseLowerCase from "./keybindings/changeCaseLowerCase";
import changeCaseUpperCase from "./keybindings/changeCaseUpperCase";
import collapse from "./keybindings/collapse";
import command from "./keybindings/command";
import copyCurrentBlockContent from "./keybindings/copyCurrentBlockContent";
import copyCurrentBlockRef from "./keybindings/copyCurrentBlockRef";
import deleteCurrentBlock from "./keybindings/deleteCurrentBlock";
import down from "./keybindings/down";
import exitEditing from "./keybindings/exitEditing";
import extend from "./keybindings/extend";
import highlightFocusIn from "./keybindings/highlightFocusIn";
import highlightFocusOut from "./keybindings/highlightFocusOut";
import indent from "./keybindings/indent";
import insert from "./keybindings/insert";
import insertBefore from "./keybindings/insertBefore";
import joinNextLine from "./keybindings/joinNextLine";
import jumpInto from "./keybindings/jumpInto";
import mark from "./keybindings/mark";
import nextNewBlock from "./keybindings/nextNewBlock";
import nextSibling from "./keybindings/nextSibling";
import number from "./keybindings/number";
import outdent from "./keybindings/outdent";
import pasteNext from "./keybindings/pasteNext";
import pastePrev from "./keybindings/pastePrev";
import prevNewBlock from "./keybindings/prevNewBlock";
import prevSibling from "./keybindings/prevSibling";
import redo from "./keybindings/redo";
import search from "./keybindings/search";
import searchBaidu from "./keybindings/searchBaidu";
import searchGithub from "./keybindings/searchGithub";
import searchGoogle from "./keybindings/searchGoogle";
import searchStackoverflow from "./keybindings/searchStackoverflow";
import searchWikipedia from "./keybindings/searchWikipedia";
import searchYoutube from "./keybindings/searchYoutube";
import toggleVisualMode from "./keybindings/toggleVisualMode";
import top from "./keybindings/top";
import undo from "./keybindings/undo";
import up from "./keybindings/up";
import { createPinia } from "pinia";

import { commands } from "./stores/command";

async function main() {
  // settings
  initSettings();

  // bindings
  number(logseq);

  undo(logseq);
  redo(logseq);

  search(logseq);

  insert(logseq);
  insertBefore(logseq);

  top(logseq);
  bottom(logseq);

  nextSibling(logseq);
  prevSibling(logseq);

  up(logseq);
  down(logseq);

  indent(logseq);
  outdent(logseq);

  nextNewBlock(logseq);
  prevNewBlock(logseq);

  deleteCurrentBlock(logseq);

  copyCurrentBlockContent(logseq);
  copyCurrentBlockRef(logseq);

  pasteNext(logseq);
  pastePrev(logseq);

  collapse(logseq);
  extend(logseq);

  // collapseAll(logseq);
  // extendAll(logseq);

  highlightFocusIn(logseq);
  highlightFocusOut(logseq);

  searchBaidu(logseq);
  searchGithub(logseq);
  searchGoogle(logseq);
  searchStackoverflow(logseq);
  searchWikipedia(logseq);
  searchYoutube(logseq);

  exitEditing(logseq);
  jumpInto(logseq);
  joinNextLine(logseq);

  toggleVisualMode(logseq);

  changeCase(logseq);
  changeCaseUpperCase(logseq);
  changeCaseLowerCase(logseq);
  command(logseq);

  // load marks
  logseq.App.onCurrentGraphChanged(async () => {
    await loadMarks();
  });

  mark(logseq);

  // setup vue
  const app = createApp(App);
  app.use(createPinia());
  app.mount("#app");

  // setup ui hotkeys
  setHotkeys(logseq);

  const el = document.querySelector(".command-input input") as HTMLInputElement;

  const handleClick = (e) => {
    const el = document.querySelector(
      ".command-input input"
    ) as HTMLInputElement;
    el && el.focus();
    e.stopPropagation();
    return false;
  };

  const handleKeyup = (e) => {
    if (e.keyCode === 38 || e.code === "ArrowUp") {
      e.stopPropagation();
      const command = getCommandFromHistoryBack();
      el.value = command;
    } else if (e.keyCode === 40 || e.code === "ArrowDown") {
      const command = getCommandFromHistoryForward();
      e.stopPropagation();
      el.value = command;
    } else if (e.keyCode === 27 || e.code === "Escape") {
      e.stopPropagation();
      el.value = "";
      hideMainUI();
    }
  };

  const handleKeydown = (e) => {
    if (e.keyCode === 9 || e.code === "Tab") {
      e.preventDefault();
      e.stopPropagation();

      const findCommand = commands.filter((c) => {
        return c.value.toLowerCase().startsWith(el.value.toLowerCase());
      });

      if (findCommand.length === 1) {
        el.value = findCommand[0].value;
      }
    }
  };

  logseq.on("ui:visible:changed", async ({ visible }) => {
    if (!visible) {
      return;
    }

    setTimeout(() => {
      // add event listeners for input element
      el.removeEventListener("click", handleClick);
      el.addEventListener("click", handleClick);

      el.removeEventListener("keyup", handleKeyup);
      el.addEventListener("keyup", handleKeyup);

      el.removeEventListener("keydown", handleKeydown);
      el.addEventListener("keydown", handleKeydown);

      // auto focus
      el && el.focus();
    }, 300);
  });
}

logseq.ready(main).catch(console.error);
