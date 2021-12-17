import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-search-baidu',
    label: 'Search in Baidu',
    keybinding: {
      mode: 'non-editing',
      binding: settings.searchBaidu
    }
  }, async () => {
    debug('Search in Baidu');
    let blockUUID = await getCurrentBlockUUID();
      if (blockUUID) {
        let block = await logseq.Editor.getBlock(blockUUID);
        if (block?.content) {
          await logseq.App.openExternalLink(`https://www.baidu.com/s?wd=${block.content}`);
        }
      }
  });
};
