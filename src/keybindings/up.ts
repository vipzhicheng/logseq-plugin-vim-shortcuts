import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-up',
    label: 'up',
    keybinding: {
      mode: 'non-editing',
      binding: 'shift+k'
    }
  }, async () => {
    debug('Up');

    // @ts-ignore
    await logseq.App.invokeExternalCommand('logseq.editor/up');
    await logseq.Editor.exitEditingMode(true);
    const uuid = await getCurrentBlockUUID();
    if (uuid) {
      setLastBlockUUID(uuid);
    }
  });
};
