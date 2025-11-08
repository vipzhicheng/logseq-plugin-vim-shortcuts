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
  getVisualMode,
  updateVisualModeIndicator,
} from "./common/funcs";
import bottom from "./keybindings/bottom";
import changeCase from "./keybindings/changeCase";
import changeCaseLowerCase from "./keybindings/changeCaseLowerCase";
import changeCaseUpperCase from "./keybindings/changeCaseUpperCase";
import changeCurrentBlock from "./keybindings/changeCurrentBlock";
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

import { commandList, useCommandStore } from "./stores/command";
import { useEmojiStore } from "@/stores/emoji";
import { useColorStore } from "./stores/color";
import { useSearchStore } from "./stores/search";

import emoji from "./keybindings/emoji";
import sort from "./keybindings/sort";
import collapseAll from "./keybindings/collapseAll";
import extendAll from "./keybindings/extendAll";
import backgroundColor from "./keybindings/backgroundColor";
import increase from "./keybindings/increase";
import decrease from "./keybindings/decrease";
import cut from "./keybindings/cut";
import cutWord from "./keybindings/cutWord";
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";
import deleteCurrentAndNextSiblingBlocks from "./keybindings/deleteCurrentAndNextSiblingBlocks";
import deleteCurrentAndPrevSiblingBlocks from "./keybindings/deleteCurrentAndPrevSiblingBlocks";

const defineSettings: SettingSchemaDesc[] = [
  {
    key: "enableVisualModeIndicator",
    title: "Enable visual mode indicator",
    description: "Enable visual mode indicator",
    default: false,
    type: "boolean",
  },

  {
    key: "showRecentEmojis",
    title: "Show recent emojis by default",
    description: "Show recent emojis by default. Needs window reload.",
    default: false,
    type: "boolean",
  },
];

logseq.useSettingsSchema(defineSettings);
logseq.onSettingsChanged(() => {
  if (logseq.settings?.enableVisualModeIndicator) {
    const visualMode = getVisualMode();
    updateVisualModeIndicator(visualMode);
  } else {
    logseq.App.registerUIItem("pagebar", {
      key: "vim-shortcut-mode",
      template: ``,
    });
  }
});

async function main() {
  // settings
  initSettings();

  logseq.provideModel({
    toggleVisualMode() {
      const visualMode = getVisualMode();
      updateVisualModeIndicator(!visualMode);
      setVisualMode(!visualMode);
    },
  });

  // setup vue
  const app = createApp(App);
  app.use(createPinia());
  app.mount("#app");

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
  deleteCurrentAndNextSiblingBlocks(logseq);
  deleteCurrentAndPrevSiblingBlocks(logseq);

  changeCurrentBlock(logseq);

  copyCurrentBlockContent(logseq);
  copyCurrentBlockRef(logseq);

  pasteNext(logseq);
  pastePrev(logseq);

  collapse(logseq);
  extend(logseq);

  collapseAll(logseq);
  extendAll(logseq);

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

  increase(logseq);
  decrease(logseq);

  cut(logseq);
  cutWord(logseq);

  toggleVisualMode(logseq);

  changeCase(logseq);
  changeCaseUpperCase(logseq);
  changeCaseLowerCase(logseq);
  sort(logseq);
  backgroundColor(logseq);
  command(logseq);

  // load marks
  logseq.App.onCurrentGraphChanged(async () => {
    await loadMarks();
  });

  mark(logseq);

  // setup ui hotkeys
  setHotkeys(logseq);
  if (logseq.settings?.enableVisualModeIndicator) {
    setVisualMode(false, false);
  } else {
    logseq.App.registerUIItem("pagebar", {
      key: "vim-shortcut-mode",
      template: ``,
    });
  }

  const emojiStore = useEmojiStore();
  emojiStore.initPicker();
  emoji(logseq);

  const colorStore = useColorStore();

  const $searchInput = document.querySelector(
    ".search-input input"
  ) as HTMLInputElement;

  const $commandInput = document.querySelector(
    ".command-input input"
  ) as HTMLInputElement;
  const $popper = document.querySelector(
    ".el-autocomplete__popper"
  ) as HTMLElement;
  const $run = document.querySelector(".command-run") as HTMLButtonElement;
  const handleCommandClick = (e) => {
    setTimeout(() => {
      $commandInput && $commandInput.focus();
    }, 100);
    e.stopPropagation();
    return false;
  };

  const handleCommandKeyup = async (e) => {
    const commandStore = useCommandStore();
    if (e.keyCode === 38 || e.code === "ArrowUp") {
      if ($popper.style.display === "none") {
        e.stopPropagation();
        const command = getCommandFromHistoryBack();
        commandStore.setInput(command);
      }
    } else if (e.keyCode === 40 || e.code === "ArrowDown") {
      if ($popper.style.display === "none") {
        const command = getCommandFromHistoryForward();
        e.stopPropagation();
        commandStore.setInput(command);
      }
    } else if (e.keyCode === 27 || e.code === "Escape") {
      e.stopPropagation();
      commandStore.emptyInput();
      hideMainUI();
    } else if (e.keyCode === 13 || e.code === "Enter") {
      e.stopPropagation();
      if ($commandInput && $commandInput.value) {
        $run.click();
      }
    }
    // console.log(e);
  };

  const handleCommandKeydown = (e) => {
    const commandStore = useCommandStore();
    if (e.keyCode === 9 || e.code === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      const keyword = commandStore.input;
      const findCommand = commandList.filter((c) => {
        return c.value.toLowerCase().startsWith(keyword.toLowerCase());
      });

      if (findCommand.length > 0) {
        if (findCommand.length === 1) {
          commandStore.setInput(findCommand[0].value);
        }
      } else {
        // not find
        const splitKeyword = keyword.split(" ");
        if (splitKeyword.length > 1) {
          const lastWord = splitKeyword[splitKeyword.length - 1];
          const subKeyword = splitKeyword[0];

          switch (subKeyword) {
            case "bg":
              const findColor = Object.keys(colorStore.namedColors).filter(
                (color) => color.startsWith(lastWord.toLowerCase())
              );
              if (findColor.length > 0) {
                if (findColor.length === 1) {
                  commandStore.setInput(
                    splitKeyword.slice(0, -1).join(" ") + " " + findColor[0]
                  );
                }
              }
              break;

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
                  commandStore.setInput(
                    splitKeyword.slice(0, -1).join(" ") + " " + findLastToken[0]
                  );
                }
              }
              break;
          }
        }
      }
    }
  };

  const handleSearchKeyup = async (e) => {
    const searchStore = useSearchStore();
    if (e.keyCode === 27 || e.code === "Escape") {
      e.stopPropagation();
      searchStore.emptyInput();
      hideMainUI();
    } else if (e.keyCode === 13 || e.code === "Enter") {
      e.stopPropagation();
      const searchStore = useSearchStore();
      searchStore.search(true);
    }
    // console.log(e);
  };

  logseq.on("ui:visible:changed", async ({ visible }) => {
    if (!visible) {
      return;
    }

    setTimeout(() => {
      // add event listeners for input element
      $commandInput &&
        $commandInput.removeEventListener("click", handleCommandClick);
      $commandInput &&
        $commandInput.addEventListener("click", handleCommandClick);

      $commandInput &&
        $commandInput.removeEventListener("keyup", handleCommandKeyup);
      $commandInput &&
        $commandInput.addEventListener("keyup", handleCommandKeyup);

      $commandInput &&
        $commandInput.removeEventListener("keydown", handleCommandKeydown);
      $commandInput &&
        $commandInput.addEventListener("keydown", handleCommandKeydown);

      $searchInput &&
        $searchInput.removeEventListener("keyup", handleSearchKeyup);
      $searchInput && $searchInput.addEventListener("keyup", handleSearchKeyup);
    }, 300);
  });
}

logseq.ready(main).catch(console.error);
