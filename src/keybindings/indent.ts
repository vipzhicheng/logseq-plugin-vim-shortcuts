import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getNumber, getSettings, resetNumber } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.indent) ? settings.indent : [settings.indent];

  bindings.forEach(binding => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-indent',
      label: 'indent',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Indent');

      // @ts-ignore
      await logseq.App.invokeExternalCommand('logseq.editor/indent');
    });
  });
};
