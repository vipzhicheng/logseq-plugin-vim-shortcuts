import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage } from '../common/funcs';
import prev from './prev';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-delete-current-block',
    label: 'Delete current block',
    keybinding: {
      mode: 'non-editing',
      binding: 'd d'
    }
  }, async () => {
    debug('delete current block');
    const page = await getCurrentPage();
    if (page?.name) {
      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        if (block?.uuid) {

          let prevBlock = await logseq.Editor.getPreviousSiblingBlock(block.uuid);
          let nextBlock = await logseq.Editor.getNextSiblingBlock(block.uuid);

          await logseq.Editor.removeBlock(block.uuid);

          let focusBlock = prevBlock || nextBlock || null;
          if (focusBlock?.uuid) {
            scrollToBlockInPage(page.name, focusBlock.uuid);
          } else if (block.left.id) {
            const parentBlock = await logseq.Editor.getBlock(block.left.id);
            if (parentBlock?.uuid) {

              scrollToBlockInPage(page.name, parentBlock.uuid);
            }
          }
        }
      }
    } else {
      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        if (block?.uuid) {

          let prevBlock = await logseq.Editor.getPreviousSiblingBlock(block.uuid);
          let nextBlock = await logseq.Editor.getNextSiblingBlock(block.uuid);

          await logseq.Editor.removeBlock(block.uuid);
          let focusBlock = prevBlock || nextBlock || null;
          if (focusBlock?.uuid) {
            await logseq.Editor.editBlock(focusBlock.uuid);
            await logseq.Editor.exitEditingMode(true);
          } else if (block.left.id) {
            const parentBlock = await logseq.Editor.getBlock(block.left.id);
            if (parentBlock?.uuid) {
              await logseq.Editor.editBlock(parentBlock.uuid);
              await logseq.Editor.exitEditingMode(true);

            }
          }
        }
      }
    }
  });
};
