import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-insert',
    label: 'Enter insert mode',
    keybinding: {
      mode: 'non-editing',
      binding: 'i'
    }
  }, async () => {
    debug('insert');

    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      setLastBlockUUID(blockUUID);
      logseq.Editor.editBlock(blockUUID);
    }
  });
};
