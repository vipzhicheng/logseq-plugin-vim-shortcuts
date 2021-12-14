import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-undo',
    label: 'Undo',
    keybinding: {
      mode: 'non-editing',
      binding: 'u'
    }
  }, async () => {
    debug('Undo');

    // @ts-ignore
    await logseq.App.invokeExternalCommand('logseq.editor/undo');
    await logseq.Editor.exitEditingMode(true);
    const uuid = await getCurrentBlockUUID();
    if (uuid) {
      setLastBlockUUID(uuid);
    }
  });
};
