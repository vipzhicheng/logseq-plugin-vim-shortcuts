import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, getSettings, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-search-stackoverflow',
    label: 'Search in Stackoverflow',
    keybinding: {
      mode: 'non-editing',
      binding: settings.searchStackoverflow
    }
  }, async () => {
    debug('Search in Stackoverflow');
    let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        if (block?.content) {
          await logseq.App.openExternalLink(`http://stackoverflow.com/search?q=${block.content}`);
        }
      }
  });
};
