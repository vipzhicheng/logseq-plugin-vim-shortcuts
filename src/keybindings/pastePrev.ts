import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings, readClipboard } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.pastePrev) ? settings.pastePrev : [settings.pastePrev];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-paste-prev-' + index,
      label: 'Paste to prev block',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Paste to prev block');
      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        if (block?.uuid) {
          await logseq.Editor.insertBlock(block.uuid, readClipboard(), {
            before: true,
            sibling: true,
          });
        }
      }
    });
  });
};
