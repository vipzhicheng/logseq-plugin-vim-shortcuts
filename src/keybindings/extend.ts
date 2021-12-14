import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-extend',
    label: 'Extend block',
    keybinding: {
      mode: 'non-editing',
      binding: 'z o'
    }
  }, async () => {
    debug('Extend block');

    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      await logseq.Editor.upsertBlockProperty(blockUUID, 'collapsed', false);
    }

  });
};
