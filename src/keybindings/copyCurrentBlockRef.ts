import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, writeClipboard } from '../common/funcs';
import { TempCache } from 'src/common/type';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-copy-current-block-ref',
    label: 'Copy current block ref',
    keybinding: {
      mode: 'non-editing',
      binding: 'shift+y'
    }
  }, async () => {
    debug('Copy current block ref');
    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);

      if (block?.uuid) {
        if (!block?.properties?.id) {
          await logseq.Editor.upsertBlockProperty(block.uuid, 'id', block.uuid);
        }
        const ref = `((${block.uuid}))`;

        writeClipboard(ref);
      }
    }
  });
};
