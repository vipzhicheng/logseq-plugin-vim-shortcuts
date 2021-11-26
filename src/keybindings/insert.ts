import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';

export default (logseq: ILSPluginUser, block: BlockEntity | null = null) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-insert',
    label: 'Enter insert mode',
    keybinding: {
      mode: 'non-editing',
      binding: 'i'
    }
  }, async aaa => {
    console.log('block.uuid', aaa);
    if (block?.uuid) {
      logseq.Editor.editBlock(block.uuid);
    }
  });
};
