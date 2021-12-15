import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, getSettings, scrollToBlockInPage, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-extend',
    label: 'Extend block',
    keybinding: {
      mode: 'non-editing',
      binding: settings.extend
    }
  }, async () => {
    debug('Extend block');

    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      await logseq.Editor.upsertBlockProperty(blockUUID, 'collapsed', false);
    }

  });
};
