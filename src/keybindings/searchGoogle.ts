import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-search-google',
    label: 'Search in Google',
    keybinding: {
      mode: 'non-editing',
      binding: 's g'
    }
  }, async () => {
    debug('Search in Google');
    let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        if (block?.content) {
          await logseq.App.openExternalLink(`https://www.google.com/search?q=${block.content}`);
        }
      }
  });
};
