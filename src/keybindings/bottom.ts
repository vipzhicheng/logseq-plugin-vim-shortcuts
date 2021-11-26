import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';

export default (logseq: ILSPluginUser, block: BlockEntity | null = null) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-bottom',
    label: 'Go to current page bottom',
    keybinding: {
      mode: 'non-editing',
      binding: 'shift+g'
    }
  }, async () => {
    logseq.App.showMsg('bottom');
    const page = await logseq.Editor.getCurrentPage();
    if (page?.name) {
      const blocks = await logseq.Editor.getPageBlocksTree(page?.name);
      if (blocks.length > 0) {
        block = blocks[blocks.length - 1];
        logseq.Editor.scrollToBlockInPage(page.name, block.uuid);
      }
    }
  });
};
