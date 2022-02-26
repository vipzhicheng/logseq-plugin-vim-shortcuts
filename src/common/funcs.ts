import "@logseq/libs";
import {
  BlockPageName,
  BlockUUID,
  ILSPluginUser,
} from "@logseq/libs/dist/LSPlugin";
import { N, TempCache } from "./type";
import { schemaVersion } from "../../package.json";
import hotkeys from "hotkeys-js";

export async function setHotkeys(logseq: ILSPluginUser) {
  hotkeys("esc", () => {
    const $input = document.querySelector(
      ".command-input input"
    ) as HTMLInputElement;
    if ($input) {
      $input.value = "";
    }
    hideMainUI();
    return false;
  });

  hotkeys("command+shift+;, ctrl+shift+;", () => {
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

export const setVisualMode = (visualMode: boolean) => {
  if (visualMode) {
    logseq.App.showMsg("Visual block mode enabled", "success");
  } else {
    logseq.App.showMsg("Visual block mode disabled", "success");
  }
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

export const hideMainUI = () => {
  logseq.hideMainUI({
    restoreEditingCursor: true,
  });
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

export const delMark = async (number: number) => {
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
export const debug = (msg: string, status = "success") => {
  if (debugMode) {
    // logseq.App.showMsg(msg, status);
    console.log(msg);
  }
};

const settingsVersion = "v1";
export const defaultSettings = {
  bottom: "shift+g",
  changeCase: "mod+shift+u",
  changeCaseUpper: "g shift+u",
  changeCaseLower: "g u",
  collapse: "z m",
  collapseAll: "z shift+m",
  copyCurrentBlockContent: "y y",
  copyCurrentBlockRef: "shift+y",
  deleteCurrentBlock: "d d",
  down: "j",
  extend: "z o",
  extendAll: "z shift+o",
  highlightFocusIn: "shift+l",
  highlightFocusOut: "shift+h",
  indent: "l",
  insert: ["i", "a"],
  insertBefore: "shift+i",
  nextNewBlock: "o",
  nextSibling: "shift+j",
  outdent: "h",
  pasteNext: "p",
  pastePrev: "shift+p",
  prevNewBlock: "shift+o",
  prevSibling: "shift+k",
  redo: "ctrl+r",
  search: "/",
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
  command: "mod+shift+;",
  settingsVersion,
  disabled: false,
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

  if (!page) {
    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);
      if (block?.page.id) {
        page = await logseq.Editor.getPage(block.page.id);
      }
    }
  }

  if (page?.name) {
    tempCache.lastPage = page.name;
  }
  return page;
};
