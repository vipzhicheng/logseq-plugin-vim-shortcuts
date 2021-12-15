import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentPage, getSettings, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-top',
    label: 'Go to current page top',
    keybinding: {
      mode: 'non-editing',
      binding: settings.top
    }
  }, async () => {
    debug('top');
    const page = await getCurrentPage();
    if (page?.name) {
      const blocks = await logseq.Editor.getPageBlocksTree(page?.name);
      if (blocks.length > 0) {
        let block = blocks[0];
        scrollToBlockInPage(page.name, block.uuid);
      }
    }
  });
};
