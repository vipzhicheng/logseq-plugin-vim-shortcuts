import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-search-wikipedia',
    label: 'Search in Wikipedia',
    keybinding: {
      mode: 'non-editing',
      binding: 's e'
    }
  }, async () => {
    debug('Search in Wikipedia');
    let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        if (block?.content) {
          await logseq.App.openExternalLink(`https://en.wikipedia.org/wiki/${block.content}`);
        }
      }
  });
};
