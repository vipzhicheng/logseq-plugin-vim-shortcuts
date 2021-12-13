import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-extend',
    label: 'Extend block',
    keybinding: {
      mode: 'non-editing',
      binding: 'l'
    }
  }, async () => {
    debug('Extend block');

    const page = await getCurrentPage();
    if (page?.name) {
      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        await logseq.Editor.upsertBlockProperty(blockUUID, 'collapsed', false);
        scrollToBlockInPage(page.name, blockUUID);
      }
    }

  });
};
