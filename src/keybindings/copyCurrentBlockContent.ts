import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, writeClipboard } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-copy-current-block-content',
    label: 'Copy current block content',
    keybinding: {
      mode: 'non-editing',
      binding: 'y y'
    }
  }, async () => {
    debug('Copy current block contents');
    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      const block = await logseq.Editor.getBlock(blockUUID);
      if (block?.content) {
        const { content } = block;
        writeClipboard(content);
      }
    }

  });
};
