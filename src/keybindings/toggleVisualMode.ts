import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getSettings, getVisualMode, setVisualMode } from '@/common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.toggleVisualMode) ? settings.toggleVisualMode : [settings.toggleVisualMode];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-toggleVisualMode-' + index,
      label: 'Toggle visual mode',
      keybinding: {
        mode: 'non-editing',
        binding,
      }
    }, async () => {
      debug('Toggle visual mode');

      const visualMode = getVisualMode();
      if (visualMode) {
        setVisualMode(false);
      } else {
        setVisualMode(true);
      }
    });
  });
};
