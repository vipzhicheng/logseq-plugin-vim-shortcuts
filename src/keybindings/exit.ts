import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-exit',
    label: 'Exit insert mode',
    keybinding: {
      mode: 'editing',
      binding: settings.exitEditing,
    }
  }, async () => {
    debug('Exit editing');

    await logseq.Editor.exitEditingMode(true);
  });
};
