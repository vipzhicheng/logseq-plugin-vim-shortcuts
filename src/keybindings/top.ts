import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';

export default (logseq: ILSPluginUser, block: BlockEntity | null = null) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-top',
    label: 'Go to current page top',
    keybinding: {
      mode: 'non-editing',
      binding: 'g g'
    }
  }, async () => {
    logseq.App.showMsg('top');
    const page = await logseq.Editor.getCurrentPage();
    if (page?.name) {
      const blocks = await logseq.Editor.getPageBlocksTree(page?.name);
      if (blocks.length > 0) {
        block = blocks[0];
        logseq.Editor.scrollToBlockInPage(page.name, block.uuid);
      }
    }
  });
};
