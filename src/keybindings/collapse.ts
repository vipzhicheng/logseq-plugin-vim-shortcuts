import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-collapse',
    label: 'Collapse block',
    keybinding: {
      mode: 'non-editing',
      binding: 'z m'
    }
  }, async () => {
    debug('Collapse block');

    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      await logseq.Editor.upsertBlockProperty(blockUUID, 'collapsed', true);
    }


  });
};
