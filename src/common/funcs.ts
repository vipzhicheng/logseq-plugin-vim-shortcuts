import '@logseq/libs';
import { BlockPageName, BlockUUID } from '@logseq/libs/dist/LSPlugin';
import { N, TempCache } from './type';

const tempCache: TempCache = {
  clipboard: '',
  lastPage: '',
};

const numberCache: N = {
  n: 1,
  lastChange: null
};

export const resetNumber = () => {
  numberCache.n = 1;
  numberCache.lastChange = null;
};

export const getNumber = (): number => {
  const now = new Date();
  if (numberCache.lastChange && now.getTime() - numberCache.lastChange.getTime() >= 10000) {
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

const debugMode = false;
export const debug = (msg: string, status = 'success') => {

  if (debugMode) {
    logseq.App.showMsg(msg, status);
  }

};

const settingsVersion = 'v1';
export const defaultSettings = {
  bottom: 'shift+g',
  collapse: 'z m',
  copyCurrentBlockContent: 'y y',
  copyCurrentBlockRef: 'shift+y',
  deleteCurrentBlock: 'd d',
  down: 'j',
  extend: 'z o',
  highlightFocusIn: 'shift+l',
  highlightFocusOut: 'shift+h',
  indent: 'l',
  insert: 'i',
  insertBefore: 'shift+i',
  nextNewBlock: 'o',
  nextSibling: 'shift+j',
  outdent: 'h',
  pasteNext: 'p',
  pastePrev: 'shift+p',
  prevNewBlock: 'shift+o',
  prevSibling: 'shift+k',
  redo: 'ctrl+r',
  search: '/',
  searchBaidu: 's b',
  searchGithub: 's h',
  searchGoogle: 's g',
  searchStackoverflow: 's s',
  searchWikipedia: 's e',
  searchYoutube: 's y',
  top: 'shift+t',
  undo: 'u',
  up: 'k',
  settingsVersion,
  disabled: false,
};

export type DefaultSettingsType = typeof defaultSettings;

export const initSettings = () => {
  let settings = logseq.settings;

  const shouldUpdateSettings = !settings || settings.settingsVersion != defaultSettings.settingsVersion;

  if (shouldUpdateSettings) {
    settings = defaultSettings;
    logseq.updateSettings(settings);
  }
};

export const getSettings = (): DefaultSettingsType => {
  let settings = logseq.settings;

  console.log('settings', settings);
  const merged = Object.assign(defaultSettings, settings);

  console.log('merged', merged);
  return merged;
};

export const writeClipboard = (content: string) => {
  tempCache.clipboard = content;
};

export const readClipboard = (): string => {
  return tempCache.clipboard;
};

export const scrollToBlockInPage = (pageName: BlockPageName, blockId: BlockUUID) => {
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
