import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-next-new-block',
    label: 'Create new next block',
    keybinding: {
      mode: 'non-editing',
      binding: 'o o'
    }
  }, async () => {
    debug('create new next block');
    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);
      if (block?.uuid) {
        const newBlock = await logseq.Editor.insertBlock(block.uuid, '', {
          before: false,
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
