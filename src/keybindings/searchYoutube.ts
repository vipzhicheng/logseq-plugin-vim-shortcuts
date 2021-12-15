import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-search-youtube',
    label: 'Search in Youtube',
    keybinding: {
      mode: 'non-editing',
      binding: 's y'
    }
  }, async () => {
    debug('Search in Youtube');
    let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        if (block?.content) {
          await logseq.App.openExternalLink(`https://www.youtube.com/results?search_query=${block.content}`);
        }
      }
  });
};
