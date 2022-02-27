import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import * as cc from 'change-case-all';
import { debug, getSettings } from '@/common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.changeCaseLower) ? settings.changeCaseLower : [settings.changeCaseLower];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-change-case-lower-' + index,
      label: 'Change case lower',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Change case lower');

      const block = await logseq.Editor.getCurrentBlock();
      if (block && block.content) {
        const content = block.content;

        await logseq.Editor.updateBlock(block.uuid, cc.lowerCase(content));

      }
    });
  });
};
