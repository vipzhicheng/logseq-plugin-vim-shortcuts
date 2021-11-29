import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { TempCache } from 'src/common/type';
import { debug, getCurrentBlockUUID, readClipboard } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-paste-prev',
    label: 'Paste to prev block',
    keybinding: {
      mode: 'non-editing',
      binding: 'shift+p'
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
};
