import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-prev',
    label: 'Go to previous line',
    keybinding: {
      mode: 'non-editing',
      binding: 'k'
    }
  }, async () => {
    debug('prev');
    const page = await getCurrentPage();
    if (page?.name) {

      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        if (block?.uuid) {
          const prevBlock = await logseq.Editor.getPreviousSiblingBlock(block.uuid);
          if (prevBlock?.uuid) {
            scrollToBlockInPage(page.name, prevBlock.uuid);
          } else if (block.parent.id) {
            const parentBlock = await logseq.Editor.getBlock(block.parent.id);
            if (parentBlock?.uuid) {
              scrollToBlockInPage(page.name, parentBlock.uuid);
            }
          }
        }
      }
    }
  });
};
