import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, scrollToBlockInPage, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-outdent',
    label: 'outdent',
    keybinding: {
      mode: 'non-editing',
      binding: 'h'
    }
  }, async () => {
    debug('Outdent');

    // @ts-ignore
    await logseq.App.invokeExternalCommand('logseq.editor/outdent');
    await logseq.Editor.exitEditingMode(true);
    const uuid = await getCurrentBlockUUID();
    if (uuid) {
      setLastBlockUUID(uuid);
    }
  });
};
