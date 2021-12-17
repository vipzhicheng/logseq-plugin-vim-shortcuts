import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-redo',
    label: 'Redo',
    keybinding: {
      mode: 'non-editing',
      binding: settings.redo
    }
  }, async () => {
    debug('redo');

    // @ts-ignore
    await logseq.App.invokeExternalCommand('logseq.editor/redo');
    await logseq.Editor.exitEditingMode(true);
  });
};
