import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-collapse',
    label: 'Collapse block',
    keybinding: {
      mode: 'non-editing',
      binding: 'h'
    }
  }, async () => {
    debug('Collapse block');

    const page = await getCurrentPage();
    if (page?.name) {
      let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        await logseq.Editor.upsertBlockProperty(blockUUID, 'collapsed', true);
        scrollToBlockInPage(page.name, blockUUID);
      }
    }


  });
};
