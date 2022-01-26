import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.searchGithub) ? settings.searchGithub : [settings.searchGithub];

  bindings.forEach(binding => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-search-github',
      label: 'Search in Github',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Search in Github');
      let blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          let block = await logseq.Editor.getBlock(blockUUID);
          if (block?.content) {
            await logseq.App.openExternalLink(`https://github.com/search?q=${block.content}`);
          }
        }
    });
  });
};
