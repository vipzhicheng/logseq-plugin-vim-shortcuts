import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, getSettings, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-highlightFocusOut',
    label: 'Highlight focus out',
    keybinding: {
      mode: 'non-editing',
      binding: settings.highlightFocusOut
    }
  }, async () => {
    debug('Highlight focus out');

    const page = await getCurrentPage();
    if (page?.name) {
      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
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
