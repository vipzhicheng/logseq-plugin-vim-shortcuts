import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings, readClipboard } from '@/common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.pasteNext) ? settings.pasteNext : [settings.pasteNext];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-paste-next-' + index,
      label: 'Paste to next block',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Paste to next block');

      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        if (block?.uuid) {
          await logseq.Editor.insertBlock(block.uuid, readClipboard(), {
            before: false,
            sibling: true,
          });
        }
      }

    });
  });
};
