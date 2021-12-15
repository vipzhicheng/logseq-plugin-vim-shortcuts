import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, getSettings, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-prev-sibling',
    label: 'Go to previous sibling',
    keybinding: {
      mode: 'non-editing',
      binding: settings.prevSibling
    }
  }, async () => {
    debug('Prev sibling');
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
