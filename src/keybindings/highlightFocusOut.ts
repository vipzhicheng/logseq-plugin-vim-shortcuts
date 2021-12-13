import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-highlightFocusOut',
    label: 'Highlight focus out',
    keybinding: {
      mode: 'non-editing',
      binding: 'shift+h'
    }
  }, async () => {
    debug('Highlight focus out');

    const page = await getCurrentPage();
    if (page?.name) {
      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        console.log('block', block);

        if (block?.parent.id) {
          const parentBlock = await logseq.Editor.getBlock(block?.parent.id);
          if (parentBlock?.uuid) {
            scrollToBlockInPage(page.name, parentBlock?.uuid);
          }
        }
      }
    }

  });
};
