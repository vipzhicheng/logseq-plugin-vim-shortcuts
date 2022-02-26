import "@logseq/libs";
import "./style.css";

import { createApp } from "vue";
import App from "./App.vue";

import { initSettings, loadMarks, setHotkeys } from "./common/funcs";
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

  // await loadMarks();
  logseq.App.onCurrentGraphChanged(async () => {
    await loadMarks();
  });

  mark(logseq);

  const app = createApp(App);
  // app.use(ElementPlus, { size: "small", zIndex: 3000 });
  app.directive("focus", {
    mounted(el) {
      console.log("xxxx");
      el.focus();
      el.children[0].focus();
      setTimeout((_) => {
        el.children[0].focus();
      }, 100);
    },
  });
  app.use(createPinia());
  app.mount("#app");
  setHotkeys(logseq);
  logseq.on("ui:visible:changed", async ({ visible }) => {
    if (!visible) {
      return;
    }

    setTimeout(() => {
      const el = document.querySelector(".command-input input");
      // @ts-ignore
      el && el.focus();
    }, 300);
  });
}

logseq.ready(main).catch(console.error);
