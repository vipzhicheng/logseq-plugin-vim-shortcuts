import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-indent',
    label: 'indent',
    keybinding: {
      mode: 'non-editing',
      binding: 'l'
    }
  }, async () => {
    debug('Indent');

    // @ts-ignore
    await logseq.App.invokeExternalCommand('logseq.editor/indent');
    await logseq.Editor.exitEditingMode(true);
    const uuid = await getCurrentBlockUUID();
    if (uuid) {
      setLastBlockUUID(uuid);
    }
  });
};
