import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { TempCache } from 'src/common/type';
import { debug, getCurrentBlockUUID, getSettings, readClipboard } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-paste-next',
    label: 'Paste to next block',
    keybinding: {
      mode: 'non-editing',
      binding: settings.pasteNext
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
};
