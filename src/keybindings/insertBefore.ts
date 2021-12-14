import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-insert-before',
    label: 'Enter insert mode at first pos ',
    keybinding: {
      mode: 'non-editing',
      binding: 'shift+i'
    }
  }, async () => {
    debug('Insert before');

    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      setLastBlockUUID(blockUUID);
      await logseq.Editor.editBlock(blockUUID, {
        pos: 0
      });
    }
  });
};
