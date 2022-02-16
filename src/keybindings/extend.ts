import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.extend) ? settings.extend : [settings.extend];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-extend-' + index,
      label: 'Extend block',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Extend block');

      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        await logseq.Editor.setBlockCollapsed(blockUUID, { flag: false });
      }

    });
  });
};
