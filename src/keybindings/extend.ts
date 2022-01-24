import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-extend',
    label: 'Extend block',
    keybinding: {
      mode: 'non-editing',
      binding: settings.extend
    }
  }, async () => {
    debug('Extend block');

    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      await logseq.Editor.setBlockCollapsed(blockUUID, { flag: false });
    }

  });
};
