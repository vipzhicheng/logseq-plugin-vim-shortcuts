import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getNumber, getSettings, resetNumber } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.down) ? settings.down : [settings.down];

  bindings.forEach(binding => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-down',
      label: 'down',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Down');

      const number = getNumber();
      resetNumber();

      for (let i = 0; i < number; i++) {
        // @ts-ignore
        await logseq.App.invokeExternalCommand('logseq.editor/down');
      }

    });
  });
};
