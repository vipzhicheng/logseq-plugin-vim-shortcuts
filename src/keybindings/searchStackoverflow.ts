import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.searchStackoverflow) ? settings.searchStackoverflow : [settings.searchStackoverflow];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-search-stackoverflow-' + index,
      label: 'Search in Stackoverflow',
      keybinding: {
        mode: 'non-editing',
        binding
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
  });
};
