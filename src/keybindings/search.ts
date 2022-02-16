import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.search) ? settings.search : [settings.search];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-search-' + index,
      label: 'Search',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Search');

      // @ts-ignore
      await logseq.App.invokeExternalCommand('logseq.go/search-in-page');
    });
  });
};
