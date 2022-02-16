import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.nextNewBlock) ? settings.nextNewBlock : [settings.nextNewBlock];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-next-new-block-' + index,
      label: 'Create new next block',
      keybinding: {
        mode: 'non-editing',
        binding
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
  });
};
