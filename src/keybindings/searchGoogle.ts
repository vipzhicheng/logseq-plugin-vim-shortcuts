import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '@/common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.searchGoogle) ? settings.searchGoogle : [settings.searchGoogle];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-search-google-' + index,
      label: 'Search in Google',
      keybinding: {
        mode: 'non-editing',
        binding
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
  });
};
