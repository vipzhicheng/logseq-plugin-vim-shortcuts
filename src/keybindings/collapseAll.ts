import { BlockUUID, ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getSettings } from '../common/funcs';

const collapse = async (blockUUID: BlockUUID | undefined) => {
  if (blockUUID) {
    try {
      await logseq.Editor.setBlockCollapsed(blockUUID, { flag: true });
    } catch(e) {}

    const block = await logseq.Editor.getBlock(blockUUID);
    if (block && block.children && block.children.length > 0) {
      for (let item of block.children) {
        if (Array.isArray(item) && item[0] === 'uuid') {
          await collapse(item[1]);
        }
      }
    }
  }
};

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-collapse-hierarchically',
    label: 'Collapse block hierarchically',
    keybinding: {
      mode: 'non-editing',
      binding: settings.collapseAll
    }
  }, async () => {
    debug('Collapse block hierarchically');

    let blockUUID = await getCurrentBlockUUID();
    await collapse(blockUUID);
  });
};
