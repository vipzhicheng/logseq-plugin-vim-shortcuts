import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-search-youtube',
    label: 'Search in Youtube',
    keybinding: {
      mode: 'non-editing',
      binding: settings.searchYoutube
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
