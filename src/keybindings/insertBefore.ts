import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-insert-before',
    label: 'Enter insert mode at first pos ',
    keybinding: {
      mode: 'non-editing',
      binding: settings.insertBefore,
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
};
