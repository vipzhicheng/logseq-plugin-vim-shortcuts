import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentPage, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-search',
    label: 'Search',
    keybinding: {
      mode: 'non-editing',
      binding: '/'
    }
  }, async () => {
    debug('Search');

    // @ts-ignore
    await logseq.App.invokeExternalCommand('logseq.go/search-in-page');
  });
};
