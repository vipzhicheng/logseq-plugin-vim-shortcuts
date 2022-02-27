import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getSettings } from '@/common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();


  const bindings = Array.isArray(settings.exitEditing) ? settings.exitEditing : [settings.exitEditing];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-exit-editing-' + index,
      label: 'Exit editing',
      keybinding: {
        mode: 'global',
        binding
      }
    }, async () => {
      debug('Exit editing');
      await logseq.Editor.exitEditingMode(true);
    });
  });

};
