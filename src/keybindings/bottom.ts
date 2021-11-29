import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, scrollToBlockInPage } from '../common/funcs';
export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-bottom',
    label: 'Go to current page bottom',
    keybinding: {
      mode: 'non-editing',
      binding: 'shift+g'
    }
  }, async () => {
    debug('bottom');
    const page = await logseq.Editor.getCurrentPage();
    if (page?.name) {
      const blocks = await logseq.Editor.getPageBlocksTree(page?.name);
      if (blocks.length > 0) {
        let block = blocks[blocks.length - 1];
        scrollToBlockInPage(page.name, block.uuid);
      }
    }
  });
};
