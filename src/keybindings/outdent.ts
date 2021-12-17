import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-outdent',
    label: 'outdent',
    keybinding: {
      mode: 'non-editing',
      binding: settings.outdent
    }
  }, async () => {
    debug('Outdent');

    // @ts-ignore
    await logseq.App.invokeExternalCommand('logseq.editor/outdent');
    await logseq.Editor.exitEditingMode(true);
  });
};
