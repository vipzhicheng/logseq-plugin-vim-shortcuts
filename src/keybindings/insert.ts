import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.insert) ? settings.insert : [settings.insert];

  bindings.forEach(binding => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-insert',
      label: 'Enter insert mode',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Insert');

      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        await logseq.Editor.editBlock(blockUUID);
      }
    });
  });
};
