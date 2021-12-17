import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getNumber, getSettings, resetNumber } from '../common/funcs';

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

    const number = getNumber();
    resetNumber();

    for (let i = 0; i < number; i++) {
      // @ts-ignore
      await logseq.App.invokeExternalCommand('logseq.editor/up');
    }
  });
};
