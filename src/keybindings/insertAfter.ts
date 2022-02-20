import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.insertAfter) ? settings.insertAfter : [settings.insertAfter];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-insert-after-' + index,
      label: 'Enter insert mode at last pos',
      keybinding: {
        mode: 'non-editing',
        binding,
      }
    }, async () => {
      debug('Insert after');

      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        const block = await logseq.Editor.getBlock(blockUUID)
        await logseq.Editor.editBlock(blockUUID, {
          pos: block.meta.endPos
        });
      }
    });
  });
};
