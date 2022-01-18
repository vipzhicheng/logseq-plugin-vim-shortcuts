import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentPage, getSettings, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-exit-editing',
    label: 'Exit editing',
    keybinding: {
      mode: 'global',
      binding: settings.exitEditing
    }
  }, async () => {
    debug('Exit editing');
    await logseq.Editor.exitEditingMode(true);
  });
};
