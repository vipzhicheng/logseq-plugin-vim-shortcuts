import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-up',
    label: 'up',
    keybinding: {
      mode: 'non-editing',
      binding: settings.up
    }
  }, async () => {
    debug('Up');

    // @ts-ignore
    await logseq.App.invokeExternalCommand('logseq.editor/up');
    await logseq.Editor.exitEditingMode(true);
  });
};
