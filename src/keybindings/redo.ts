import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-redo',
    label: 'Redo',
    keybinding: {
      mode: 'non-editing',
      binding: 'ctrl+r'
    }
  }, async () => {
    debug('redo');

    // @ts-ignore
    await logseq.App.invokeExternalCommand('logseq.editor/redo');
    await logseq.Editor.exitEditingMode(true);

    const uuid = await getCurrentBlockUUID();
    if (uuid) {
      setLastBlockUUID(uuid);
    }
  });
};
