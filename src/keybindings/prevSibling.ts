import { BlockUUID, ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, getNumber, getSettings, resetNumber, scrollToBlockInPage } from '../common/funcs';

const goPrevSibling = async (lastBlockUUID: BlockUUID | undefined) => {
  const page = await getCurrentPage();
  if (page?.name) {
    let blockUUID = lastBlockUUID || (await getCurrentBlockUUID());
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);
      if (block?.uuid) {
        const prevBlock = await logseq.Editor.getPreviousSiblingBlock(block.uuid);
        if (prevBlock?.uuid) {
          scrollToBlockInPage(page.name, prevBlock.uuid);
          return prevBlock.uuid;
        } else if (block.parent.id) {
          const parentBlock = await logseq.Editor.getBlock(block.parent.id);
          if (parentBlock?.uuid) {
            scrollToBlockInPage(page.name, parentBlock.uuid);
            return parentBlock.uuid;
          }
        }
      }
    }
  }
};

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.prevSibling) ? settings.prevSibling : [settings.prevSibling];

  bindings.forEach(binding => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-prev-sibling',
      label: 'Go to previous sibling',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Prev sibling');

      const number = getNumber();
      resetNumber();

      let lastBlockUUID: BlockUUID | undefined = undefined;
      for (let i = 0; i < number; i++) {
        lastBlockUUID = await goPrevSibling(lastBlockUUID);
      }
    });
  });
};
