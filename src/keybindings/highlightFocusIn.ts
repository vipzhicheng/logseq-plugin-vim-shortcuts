import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, getSettings, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-highlightFocusIn',
    label: 'Highlight focus in',
    keybinding: {
      mode: 'non-editing',
      binding: settings.highlightFocusIn
    }
  }, async () => {
    debug('Highlight focus in');

    const page = await getCurrentPage();
    if (page?.name) {
      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        console.log(block);
        if (block?.children && block?.children?.length > 0) {
          let focusInBlock = block.children[block.children.length - 1];
          if (Array.isArray(focusInBlock) && focusInBlock[0] === 'uuid') {
            scrollToBlockInPage(page.name, focusInBlock[1]);
          }

        }
      }
    }

  });
};
