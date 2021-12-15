import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-search-baidu',
    label: 'Search in Baidu',
    keybinding: {
      mode: 'non-editing',
      binding: 's b'
    }
  }, async () => {
    debug('Search in Baidu');
    let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        if (block?.content) {
          await logseq.App.openExternalLink(`https://www.baidu.com/s?wd=${block.content}`);
        }
      }
  });
};
