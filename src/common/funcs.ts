import '@logseq/libs';
import { BlockIdentity, BlockPageName, BlockUUID } from '@logseq/libs/dist/LSPlugin';
import { TempCache } from './type';

const tempCache: TempCache = {
  clipboard: '',
  lastBlock: '',
};


const debugMode = false;
export const debug = (msg: string, status = 'success') => {

  if (debugMode) {
    logseq.App.showMsg(msg, status);
  }

};


export const writeClipboard = (content: string) => {
  tempCache.clipboard = content;
};

export const readClipboard = () => {
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
  if (tempCache.lastBlock) {
    return tempCache.lastBlock;
  } else {
    let block = await logseq.Editor.getCurrentBlock();
    return block?.uuid;
  }
};
