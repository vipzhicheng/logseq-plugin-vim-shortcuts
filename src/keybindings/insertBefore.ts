import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.insertBefore) ? settings.insertBefore : [settings.insertBefore];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-insert-before-' + index,
      label: 'Enter insert mode at first pos ',
      keybinding: {
        mode: 'non-editing',
        binding,
      }
    }, async () => {
      debug('Insert before');

      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        await logseq.Editor.editBlock(blockUUID, {
          pos: 0
        });
      }
    });
  });
};
