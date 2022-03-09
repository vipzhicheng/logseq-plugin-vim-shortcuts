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
  setVisualMode,
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

import { commandList } from "./stores/command";

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
  setVisualMode(false);

  const $input = document.querySelector(
    ".command-input input"
  ) as HTMLInputElement;
  const $popper = document.querySelector(
    ".el-autocomplete__popper"
  ) as HTMLElement;
  const $run = document.querySelector(".command-run") as HTMLButtonElement;
  const handleClick = (e) => {
    $input && $input.focus();
    e.stopPropagation();
    return false;
  };

  const handleKeyup = async (e) => {
    if (e.keyCode === 38 || e.code === "ArrowUp") {
      if ($popper.style.display === "none") {
        e.stopPropagation();
        const command = getCommandFromHistoryBack();
        $input.value = command;
      }
    } else if (e.keyCode === 40 || e.code === "ArrowDown") {
      if ($popper.style.display === "none") {
        const command = getCommandFromHistoryForward();
        e.stopPropagation();
        $input.value = command;
      }
    } else if (e.keyCode === 27 || e.code === "Escape") {
      e.stopPropagation();
      $input.value = "";
      hideMainUI();
    } else if (e.keyCode === 13 || e.code === "Enter") {
      e.stopPropagation();
      if ($input.value) {
        $run.click();
      }
    }
    // console.log(e);
  };

  const handleKeydown = (e) => {
    if (e.keyCode === 9 || e.code === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      const keyword = $input.value;
      const findCommand = commandList.filter((c) => {
        return c.value.toLowerCase().startsWith(keyword.toLowerCase());
      });

      if (findCommand.length > 0) {
        if (findCommand.length === 1) {
          $input.value = findCommand[0].value;
        }
      } else {
        // not find
        const splitKeyword = keyword.split(" ");
        if (splitKeyword.length > 1) {
          const lastWord = splitKeyword[splitKeyword.length - 1];
          const subKeyword = splitKeyword[0];

          switch (subKeyword) {
            case "go":
            case "go!":
              const tokens = [
                "@today",
                "@yesterday",
                "@tomorrow",
                "@prev",
                "@next",
                "@back",
                "@forward",
                "@index",
              ];
              const findLastToken = tokens.filter((token) => {
                return token.toLowerCase().startsWith(lastWord.toLowerCase());
              });
              if (findLastToken.length > 0) {
                if (findLastToken.length === 1) {
                  $input.value =
                    splitKeyword.slice(0, -1).join(" ") +
                    " " +
                    findLastToken[0];
                }
              }
              break;
          }
        }
      }
    }
  };

  logseq.on("ui:visible:changed", async ({ visible }) => {
    if (!visible) {
      return;
    }

    setTimeout(() => {
      // add event listeners for input element
      $input.removeEventListener("click", handleClick);
      $input.addEventListener("click", handleClick);

      $input.removeEventListener("keyup", handleKeyup);
      $input.addEventListener("keyup", handleKeyup);

      $input.removeEventListener("keydown", handleKeydown);
      $input.addEventListener("keydown", handleKeydown);

      // auto focus
      $input && $input.focus();
    }, 300);
  });
}

logseq.ready(main).catch(console.error);
