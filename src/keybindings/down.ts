import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getNumber, getSettings, getVisualMode, resetNumber } from '@/common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.down) ? settings.down : [settings.down];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-down-' + index,
      label: 'down',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      const number = getNumber();
      resetNumber();

      const visualMode = getVisualMode();

      if (visualMode) {
        debug('Select down');
        for (let i = 0; i < number; i++) {
          // @ts-ignore
          await logseq.App.invokeExternalCommand('logseq.editor/select-block-down');
        }
      } else {
        debug('Down');
        for (let i = 0; i < number; i++) {
          // @ts-ignore
          await logseq.App.invokeExternalCommand('logseq.editor/down');
        }
      }

    });
  });
};
