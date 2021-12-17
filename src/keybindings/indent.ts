import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-indent',
    label: 'indent',
    keybinding: {
      mode: 'non-editing',
      binding: settings.indent
    }
  }, async () => {
    debug('Indent');

    // @ts-ignore
    await logseq.App.invokeExternalCommand('logseq.editor/indent');
    await logseq.Editor.exitEditingMode(true);
  });
};
