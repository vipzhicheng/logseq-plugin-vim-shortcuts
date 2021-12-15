import '@logseq/libs';
import { BlockIdentity, BlockPageName, BlockUUID } from '@logseq/libs/dist/LSPlugin';
import { TempCache } from './type';

const tempCache: TempCache = {
  clipboard: '',
  lastBlock: '',
  lastPage: '',
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
  tempCache.lastBlock = blockId;
};

export const getLastBlockUUID = () => {
  return tempCache.lastBlock;
};

export const setLastBlockUUID = (uuid:BlockUUID) => {
  return tempCache.lastBlock = uuid;
};

export const getCurrentBlockUUID = async (): Promise<BlockUUID | undefined> => {
  const page = await logseq.Editor.getCurrentPage();
  // When page is not null, means it's on page not home
  if (page && tempCache.lastBlock) {
    return tempCache.lastBlock;
  } else {
    let block = await logseq.Editor.getCurrentBlock();
    return block?.uuid;
  }
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
    if (tempCache !== page.name) {
      tempCache.lastBlock = '';
    }
    tempCache.lastPage = page.name;
  }
  return page;
};
