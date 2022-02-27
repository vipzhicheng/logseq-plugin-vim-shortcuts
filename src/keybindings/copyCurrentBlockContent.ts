import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings, writeClipboard } from '@/common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.copyCurrentBlockContent) ? settings.copyCurrentBlockContent : [settings.copyCurrentBlockContent];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-copy-current-block-content-' + index,
      label: 'Copy current block content',
      keybinding: {
        mode: 'non-editing',
        binding
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
  });
};
