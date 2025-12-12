import "@logseq/libs";
import {
  BlockEntity,
  BlockPageName,
  BlockUUID,
  ILSPluginUser,
  PageEntity,
} from "@logseq/libs/dist/LSPlugin";
import { N, TempCache } from "./type";
import { schemaVersion } from "../../package.json";
import hotkeys from "hotkeys-js";
import { useCommandStore } from "@/stores/command";
import { useColorStore } from "@/stores/color";
import { useSearchStore } from "@/stores/search";

export const clearBlocksHighlight = async (blocks: BlockEntity[]) => {
  for (const block of blocks) {
    const regex = /<mark class="vim-shortcuts-highlight">(.*?)<\/mark>/;
    const el = top!.document.getElementById(`block-content-${block.uuid}`);
    if (el?.innerHTML && regex.test(el.innerHTML)) {
      el.innerHTML = el.innerHTML.replace(regex, "$1");
    }

    if (block.children.length > 0) {
      await clearBlocksHighlight(block.children as BlockEntity[]);
    }
  }
};

export const clearCurrentPageBlocksHighlight = async () => {
  let page = await logseq.Editor.getCurrentPage();
  let blocks;
  if (page) {
    blocks = await logseq.Editor.getCurrentPageBlocksTree();
  } else {
    const block = await logseq.Editor.getCurrentBlock();
    if (block) {
      page = await logseq.Editor.getPage(block.page.id);
      blocks = await logseq.Editor.getPageBlocksTree(page.name);
    }
  }
  if (blocks && blocks.length > 0) {
    await clearBlocksHighlight(blocks);
  }
};

export async function createPageIfNotExists(pageName): Promise<PageEntity> {
  let page = await logseq.Editor.getPage(pageName);
  if (!page) {
    page = await logseq.Editor.createPage(
      pageName,
      {},
      {
        createFirstBlock: true,
        redirect: false,
      }
    );
  }

  return page;
}

export async function setHotkeys(logseq: ILSPluginUser) {
  hotkeys("esc", () => {
    hideMainUI();
    return false;
  });

  hotkeys("command+shift+;, ctrl+shift+;, shift+;", () => {
    const $input = document.querySelector(
      ".command-input input"
    ) as HTMLInputElement;
    $input && $input.focus();
    return false;
  });
}

export async function getGraphKey(key: string): Promise<string> {
  const graph = await logseq.App.getCurrentGraph();
  return (
    "logseq-plugin-vim-shortcuts:" +
    key +
    ":" +
    schemaVersion +
    ":" +
    (graph?.path ?? "nograph")
  );
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const tempCache: TempCache = {
  clipboard: "",
  lastPage: "",
  visualMode: false,
};

export const writeClipboard = (content: string) => {
  tempCache.clipboard = content;
};

export const readClipboard = (): string => {
  return tempCache.clipboard;
};

export const updateVisualModeIndicator = (visualMode: boolean) => {
  if (visualMode) {
    logseq.App.registerUIItem("pagebar", {
      key: "vim-shortcut-mode",
      template: `
        <span class="">
          <a title="Visual mode" class="button" data-on-click="toggleVisualMode" style="font-size: 18px">
            Visual
          </a>
        </span>
      `,
    });
  } else {
    logseq.App.registerUIItem("pagebar", {
      key: "vim-shortcut-mode",
      template: `
        <span class="">
          <a title="Non-Visual mode" class="button" data-on-click="toggleVisualMode" style="font-size: 18px">
            Normal
          </a>
        </span>
      `,
    });
  }
};

export const setVisualMode = (visualMode: boolean, message = true) => {
  if (visualMode) {
    message && logseq.App.showMsg("Visual block mode enabled", "success");
  } else {
    message && logseq.App.showMsg("Visual block mode disabled", "success");
  }
  updateVisualModeIndicator(visualMode);
  tempCache.visualMode = visualMode;
};

export const getVisualMode = (): boolean => {
  return tempCache.visualMode;
};

const numberCache: N = {
  n: 1,
  lastChange: null,
};

export const resetNumber = () => {
  numberCache.n = 1;
  numberCache.lastChange = null;
};

export const getNumber = (): number => {
  const now = new Date();
  if (
    numberCache.lastChange &&
    now.getTime() - numberCache.lastChange.getTime() >= 10000
  ) {
    resetNumber();
  }
  return numberCache.n;
};

export const setNumber = (n: number) => {
  const now = new Date();

  if (numberCache.lastChange === null) {
    if (n > 0) {
      numberCache.n = n;
      numberCache.lastChange = now;
    }
  } else {
    if (now.getTime() - numberCache.lastChange.getTime() >= 1000) {
      numberCache.n = n;
      numberCache.lastChange = now;
    } else {
      numberCache.n = numberCache.n * 10 + n;
      numberCache.lastChange = now;
    }
  }
};

let commandHistory: string[] = [];
let commandCursor = 0;

export const pushCommandHistory = (command: string) => {
  commandHistory.unshift(command);
  commandCursor = 0;
  if (commandHistory.length > 1000) {
    commandHistory.pop();
  }
};

export const getCommandFromHistoryBack = (): string => {
  commandCursor = commandCursor % commandHistory.length;
  const command = commandHistory[commandCursor] || "";
  commandCursor++;
  return command;
};

export const getCommandFromHistoryForward = (): string => {
  commandCursor =
    commandCursor < 0 ? commandCursor + commandHistory.length : commandCursor;
  const command = commandHistory[commandCursor] || "";
  commandCursor--;
  return command;
};

export const resetCommandCursor = () => {
  commandCursor = 0;
};

export const showMainUI = (inputVisible) => {
  const commandStore = useCommandStore();
  commandStore.setVisible(inputVisible);
  logseq.showMainUI({
    autoFocus: true,
  });
};

export const hideMainUI = () => {
  const commandStore = useCommandStore();
  commandStore.emptyInput();
  commandStore.hide();

  const searchStore = useSearchStore();
  searchStore.hide();

  const colorStore = useColorStore();
  colorStore.hide();

  logseq.hideMainUI({
    restoreEditingCursor: true,
  });
  logseq.Editor.restoreEditingCursor();
  resetCommandCursor();
};

let markCache: {
  [key: string]: {
    page: string;
    block?: BlockUUID | undefined;
  };
} = {};

export const setMark = async (
  number: number,
  page: BlockPageName,
  block: BlockUUID | undefined = undefined
) => {
  markCache[number] = {
    page,
    block,
  };

  const graphKey = await getGraphKey("markCache");
  localStorage.setItem(graphKey, JSON.stringify(markCache));
};

export const loadMarks = async () => {
  const graphKey = await getGraphKey("markCache");
  const markCacheStr = localStorage.getItem(graphKey);
  if (markCacheStr) {
    markCache = JSON.parse(markCacheStr) || {};
  } else {
    markCache = {};
  }
};

export const getMark = (number: number) => {
  return markCache[number] || undefined;
};

export const getMarks = () => {
  return markCache;
};

export const delMark = async (number: string) => {
  delete markCache[number];
  const graphKey = await getGraphKey("markCache");
  localStorage.setItem(graphKey, JSON.stringify(markCache));
};

export const clearMarks = async () => {
  markCache = {};
  const graphKey = await getGraphKey("markCache");
  localStorage.setItem(graphKey, JSON.stringify(markCache));
};

const debugMode = false;
export const debug = (msg: any, status = "success") => {
  if (debugMode) {
    // logseq.App.showMsg(msg, status);
    console.log(msg);
  }
};

const settingsVersion = "v4";
export const defaultSettings = {
  keyBindings: {
    bottom: "shift+g",
    changeCase: "mod+shift+u",
    changeCaseUpper: "g shift+u",
    changeCaseLower: "g u",
    changeCurrentBlock: "d c",
    collapse: "z c",
    collapseAll: "z shift+c",
    copyCurrentBlockContent: "y y",
    copyCurrentBlockRef: "shift+y",
    deleteCurrentBlock: "d d",
    deleteCurrentAndNextSiblingBlocks: "d j",
    deleteCurrentAndPrevSiblingBlocks: "d k",
    down: "j",
    extend: "z o",
    extendAll: "z shift+o",
    highlightFocusIn: "l",
    highlightFocusOut: "h",
    indent: "shift+l",
    insert: ["shift+a", "a"],
    insertBefore: ["shift+i", "i"],
    nextNewBlock: "o",
    nextSibling: "shift+j",
    outdent: "shift+h",
    pasteNext: "p",
    pastePrev: "shift+p",
    prevNewBlock: "shift+o",
    prevSibling: "shift+k",
    redo: "ctrl+r",
    search: "/",
    searchPrev: "shift+n",
    searchNext: "n",
    searchCleanup: "s q",
    searchBaidu: "s b",
    searchGithub: "s h",
    searchGoogle: "s g",
    searchStackoverflow: "s s",
    searchWikipedia: "s e",
    searchYoutube: "s y",
    top: "shift+t",
    undo: "u",
    up: "k",
    exitEditing: ["mod+j mod+j", "ctrl+["],
    jumpInto: "mod+shift+enter",
    joinNextLine: "mod+alt+j",
    toggleVisualMode: "ctrl+v",
    markSave: "m",
    markJump: "'",
    markJumpSidebar: "mod+'",
    increase: "ctrl+a",
    decrease: "ctrl+x",
    cut: "x",
    cutWord: "shift+x",
    command: ["mod+alt+;", "mod+shift+;"],
    emoji: "mod+/",
  },
  settingsVersion,
  disabled: false,
  showRecentEmojis: false,
};

export type DefaultSettingsType = typeof defaultSettings;

export const initSettings = () => {
  let settings = logseq.settings;

  const shouldUpdateSettings =
    !settings || settings.settingsVersion != defaultSettings.settingsVersion;

  if (shouldUpdateSettings) {
    settings = defaultSettings;
    logseq.updateSettings(settings);
  }
};

export const getSettings = (): DefaultSettingsType => {
  let settings = logseq.settings;
  const merged = Object.assign(defaultSettings, settings);
  return merged;
};

export const scrollToBlockInPage = (
  pageName: BlockPageName,
  blockId: BlockUUID
) => {
  logseq.Editor.scrollToBlockInPage(pageName, blockId);
};

export const getCurrentBlockUUID = async (): Promise<BlockUUID | undefined> => {
  let block = await logseq.Editor.getCurrentBlock();
  return block?.uuid;
};

export const getCurrentPage = async () => {
  let page = await logseq.Editor.getCurrentPage();

  // if (!page) {
  //   let blockUUID = await getCurrentBlockUUID();
  //   if (blockUUID) {
  //     let block = await logseq.Editor.getBlock(blockUUID);
  //     if (block?.page.id) {
  //       page = await logseq.Editor.getPage(block.page.id);
  //     }
  //   }
  // }

  if (page?.name) {
    tempCache.lastPage = page.name;
  }
  return page;
};

export function hexToRgb(hex) {
  const hexCode = hex.charAt(0) === "#" ? hex.substr(1, 6) : hex;

  const hexR = parseInt(hexCode.substr(0, 2), 16);
  const hexG = parseInt(hexCode.substr(2, 2), 16);
  const hexB = parseInt(hexCode.substr(4, 2), 16);

  return [hexR, hexG, hexB];
}

export function filterDarkColor(hexColor) {
  const [r, g, b] = hexToRgb(hexColor);
  return r * 0.299 + g * 0.587 + b * 0.114 < 150;
}
