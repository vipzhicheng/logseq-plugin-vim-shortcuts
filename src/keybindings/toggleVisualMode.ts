import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getSettings, getVisualMode, setVisualMode } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.toggleVisualMode) ? settings.toggleVisualMode : [settings.toggleVisualMode];

  bindings.forEach(binding => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-toggleVisualMode',
      label: 'Toggle visual mode',
      keybinding: {
        mode: 'global',
        binding
      }
    }, async () => {
      debug('Toggle visual mode');

      await logseq.Editor.exitEditingMode(true);

      const visualMode = getVisualMode();
      if (visualMode) {
        setVisualMode(false);
      } else {
        setVisualMode(true);
      }
    });
  });
};
