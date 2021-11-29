import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-prev-new-block',
    label: 'Create new prev block',
    keybinding: {
      mode: 'non-editing',
      binding: 'shift+o'
    }
  }, async () => {
    debug('create new prev block');
    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);
      if (block?.uuid) {
        const newBlock = await logseq.Editor.insertBlock(block.uuid, '', {
          before: true,
          sibling: true,
        });

        if (newBlock?.uuid) {
          setLastBlockUUID(newBlock.uuid);
          await logseq.Editor.editBlock(newBlock.uuid);
        }
      }
    }
  });
};
