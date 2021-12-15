import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getCurrentPage, getSettings, scrollToBlockInPage, setLastBlockUUID } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-collapse',
    label: 'Collapse block',
    keybinding: {
      mode: 'non-editing',
      binding: settings.collapse
    }
  }, async () => {
    debug('Collapse block');

    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      await logseq.Editor.upsertBlockProperty(blockUUID, 'collapsed', true);
    }


  });
};
