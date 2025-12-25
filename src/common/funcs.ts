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
    const el = top!.document.getElementById(`block-content-${block.uuid}`);
    if (el?.innerHTML) {
      // Use global regex to replace ALL highlight marks in this block
      const regex = /<mark class="vim-shortcuts-highlight">(.*?)<\/mark>/g;
      el.innerHTML = el.innerHTML.replace(regex, "$1");
    }

    if (block.children && block.children.length > 0) {
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
};

export const writeClipboard = (content: string) => {
  tempCache.clipboard = content;
};

export const readClipboard = (): string => {
  return tempCache.clipboard;
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

export const hasExplicitNumber = (): boolean => {
  return numberCache.lastChange !== null;
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

let blockMarkCache: {
  [key: string]: {
    page: string;
    block: BlockUUID;
    note?: string;
  };
} = {};

let pageMarkCache: {
  [key: string]: {
    page: string;
    note?: string;
  };
} = {};

/**
 * Extract plain text from block content by removing special chars, HTML tags, and Markdown syntax
 * @param content - The block content string
 * @returns Plain text string, max 20 chars
 */
export const extractPlainText = (content: string): string => {
  try {
    if (!content || typeof content !== "string") return "";

    let text = content;

    // Remove Logseq properties (key:: value)
    text = text.replace(/^[\w\-]+::\s*.+$/gm, "");
    text = text.replace(/[\w\-]+::\s*[^\n]+/g, "");

    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, "");

    // Extract content from Logseq page references [[xyz]] -> xyz
    text = text.replace(/\[\[(.+?)\]\]/g, "$1");

    // Extract content from Logseq block references ((xyz)) -> xyz
    text = text.replace(/\(\((.+?)\)\)/g, "$1");

    // Remove Markdown syntax
    text = text.replace(/\*\*(.+?)\*\*/g, "$1"); // Bold
    text = text.replace(/__(.+?)__/g, "$1");
    text = text.replace(/\*(.+?)\*/g, "$1"); // Italic
    text = text.replace(/_(.+?)_/g, "$1");
    text = text.replace(/~~(.+?)~~/g, "$1"); // Strikethrough
    text = text.replace(/`(.+?)`/g, "$1"); // Inline code
    text = text.replace(/==(.+?)==/g, "$1"); // Highlight
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, "$1"); // Links
    text = text.replace(/^#{1,6}\s+/gm, ""); // Headers
    text = text.replace(/^[-*]\s+\[([ x])\]\s+/gm, ""); // Task list
    text = text.replace(/^[-*]\s+/gm, ""); // Unordered list
    text = text.replace(/^>\s+/gm, ""); // Block quotes
    text = text.replace(/^\d+\.\s+/gm, ""); // Ordered list

    // Remove extra whitespace and newlines
    text = text.replace(/\s+/g, " ").trim();

    // Limit to 20 characters
    return text.substring(0, 20);
  } catch (error) {
    console.error("Error extracting plain text:", error);
    return "";
  }
};

export const setMark = async (
  number: number,
  page: BlockPageName,
  block: BlockUUID | undefined = undefined
) => {
  try {
    const storage = logseq.Assets.makeSandboxStorage();

    if (block) {
      // Block mark - extract note from block content
      let note = "";
      try {
        const blockEntity = await logseq.Editor.getBlock(block);
        if (blockEntity && blockEntity.content) {
          note = extractPlainText(blockEntity.content);
        }
      } catch (error) {
        console.error("Failed to extract note from block:", error);
        // Continue with empty note
      }

      blockMarkCache[number] = {
        page,
        block,
        note,
      };

      await storage.setItem("block-marks.json", JSON.stringify(blockMarkCache));
    } else {
      // Page mark - use empty note initially
      pageMarkCache[number] = {
        page,
        note: "",
      };

      await storage.setItem("page-marks.json", JSON.stringify(pageMarkCache));
    }
  } catch (error) {
    console.error("Failed to set mark:", error);
    throw error;
  }
};

export const loadMarks = async () => {
  try {
    const storage = logseq.Assets.makeSandboxStorage();

    // Load block marks
    const blockMarkCacheStr = await storage.getItem("block-marks.json");
    if (blockMarkCacheStr) {
      const loaded = JSON.parse(blockMarkCacheStr as string) || {};
      // Ensure all entries have the note field for backward compatibility
      blockMarkCache = {};
      Object.keys(loaded).forEach((key) => {
        blockMarkCache[key] = {
          ...loaded[key],
          note: loaded[key].note || "", // Add empty note if missing
        };
      });
    } else {
      blockMarkCache = {};
    }

    // Load page marks
    const pageMarkCacheStr = await storage.getItem("page-marks.json");
    if (pageMarkCacheStr) {
      const loaded = JSON.parse(pageMarkCacheStr as string) || {};
      // Ensure all entries have the note field for backward compatibility
      pageMarkCache = {};
      Object.keys(loaded).forEach((key) => {
        pageMarkCache[key] = {
          ...loaded[key],
          note: loaded[key].note || "", // Add empty note if missing
        };
      });
    } else {
      pageMarkCache = {};
    }
  } catch (error) {
    console.error("Failed to load marks:", error);
    blockMarkCache = {};
    pageMarkCache = {};
  }
};

export const getMark = (
  number: number,
  isPageMark: boolean = false
): { page: string; block: BlockUUID } | { page: string } | undefined => {
  if (isPageMark) {
    return pageMarkCache[number] || undefined;
  } else {
    return blockMarkCache[number] || undefined;
  }
};

export const getBlockMark = (number: number) => {
  return blockMarkCache[number] || undefined;
};

export const getPageMark = (number: number) => {
  return pageMarkCache[number] || undefined;
};

export const getMarks = () => {
  // Merge both caches for backward compatibility
  const merged = {};
  Object.keys(blockMarkCache).forEach((key) => {
    merged[key] = blockMarkCache[key];
  });
  Object.keys(pageMarkCache).forEach((key) => {
    merged[key] = pageMarkCache[key];
  });
  return merged;
};

export const getBlockMarks = () => {
  return blockMarkCache;
};

export const getPageMarks = () => {
  return pageMarkCache;
};

export const delMark = async (number: string, isPageMark: boolean = false) => {
  const storage = logseq.Assets.makeSandboxStorage();

  if (isPageMark) {
    delete pageMarkCache[number];
    await storage.setItem("page-marks.json", JSON.stringify(pageMarkCache));
  } else {
    delete blockMarkCache[number];
    await storage.setItem("block-marks.json", JSON.stringify(blockMarkCache));
  }
};

export const clearMarks = async () => {
  const storage = logseq.Assets.makeSandboxStorage();
  blockMarkCache = {};
  pageMarkCache = {};
  await storage.setItem("block-marks.json", JSON.stringify(blockMarkCache));
  await storage.setItem("page-marks.json", JSON.stringify(pageMarkCache));
};

export const clearBlockMarks = async () => {
  const storage = logseq.Assets.makeSandboxStorage();
  blockMarkCache = {};
  await storage.setItem("block-marks.json", JSON.stringify(blockMarkCache));
};

export const clearPageMarks = async () => {
  const storage = logseq.Assets.makeSandboxStorage();
  pageMarkCache = {};
  await storage.setItem("page-marks.json", JSON.stringify(pageMarkCache));
};

/**
 * Update the note for a block mark
 */
export const updateBlockMarkNote = async (number: string, note: string) => {
  if (blockMarkCache[number]) {
    blockMarkCache[number].note = note;
    const storage = logseq.Assets.makeSandboxStorage();
    await storage.setItem("block-marks.json", JSON.stringify(blockMarkCache));
  }
};

/**
 * Update the note for a page mark
 */
export const updatePageMarkNote = async (number: string, note: string) => {
  if (pageMarkCache[number]) {
    pageMarkCache[number].note = note;
    const storage = logseq.Assets.makeSandboxStorage();
    await storage.setItem("page-marks.json", JSON.stringify(pageMarkCache));
  }
};

const debugMode = false;
export const debug = (msg: any, status = "success") => {
  if (debugMode) {
    // logseq.UI.showMsg(msg, status);
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
    highlightFocusIn: "shift+l",
    highlightFocusOut: "shift+h",
    indent: ["shift+."],
    insert: ["shift+a", "a"],
    insertBefore: ["shift+i", "i"],
    left: "h",
    right: "l",
    wordForward: "w",
    wordBackward: "b",
    wordEnd: "e",
    lineEnd: "shift+4",
    findChar: "f",
    findCharBackward: "shift+f",
    repeatCharSearch: ";",
    repeatCharSearchReverse: ",",
    nextNewBlock: "o",
    nextSibling: "shift+j",
    outdent: ["shift+,"],
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
    toggleVisualMode: "v",
    markSave: "m",
    markPageSave: "shift+m",
    markJump: "'",
    markPageJump: "shift+'",
    markJumpSidebar: "mod+'",
    markPageJumpSidebar: "mod+shift+'",
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
    tempCache.lastPage = page.name as string;
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
