import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-next-new-block',
    label: 'Create new next block',
    keybinding: {
      mode: 'non-editing',
      binding: settings.nextNewBlock
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
          await logseq.Editor.editBlock(newBlock.uuid);
        }
      }
    }
  });
};
