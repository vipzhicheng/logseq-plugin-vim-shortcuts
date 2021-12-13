import { ILSPluginUser, BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage } from '../common/funcs';

const findNextBlockRecur = async (page: PageEntity | BlockEntity, block: BlockEntity) => {
  if (block.parent.id) {
    const parentBlock = await logseq.Editor.getBlock(block.parent.id);
    if (parentBlock?.uuid) {
      const parentNextBlock = await logseq.Editor.getNextSiblingBlock(parentBlock?.uuid);
      if (parentNextBlock?.uuid) {
        scrollToBlockInPage(page.name, parentNextBlock.uuid);
      } else if (parentBlock.parent.id) {
        await findNextBlockRecur(page, parentBlock);
      }
    }
  }

};

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-next',
    label: 'Go to next line',
    keybinding: {
      mode: 'non-editing',
      binding: 'j'
    }
  }, async () => {
    debug('next');
    const page = await getCurrentPage();
    if (page?.name) {
      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        if (block?.uuid) {
          const nextBlock = await logseq.Editor.getNextSiblingBlock(block.uuid);
          if (nextBlock?.uuid) {
            scrollToBlockInPage(page.name, nextBlock.uuid);
          } else if (block.parent.id) {
            await findNextBlockRecur(page, block);
          }
        }
      }
    }
  });
};
