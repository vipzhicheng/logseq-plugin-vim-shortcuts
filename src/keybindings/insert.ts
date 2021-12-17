import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-insert',
    label: 'Enter insert mode',
    keybinding: {
      mode: 'non-editing',
      binding: settings.insert
    }
  }, async () => {
    debug('Insert');

    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      await logseq.Editor.editBlock(blockUUID);
    }
  });
};
