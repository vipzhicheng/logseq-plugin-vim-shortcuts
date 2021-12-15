import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings, writeClipboard } from '../common/funcs';


export default (logseq: ILSPluginUser) => {
  const settings = getSettings();
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-copy-current-block-ref',
    label: 'Copy current block ref',
    keybinding: {
      mode: 'non-editing',
      binding: settings.copyCurrentBlockRef
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
