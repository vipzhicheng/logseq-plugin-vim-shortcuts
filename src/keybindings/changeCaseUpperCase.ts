import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import * as cc from 'change-case-all';
import { debug, getNumber, getSettings, resetNumber } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.changeCaseUpper) ? settings.changeCaseUpper : [settings.changeCaseUpper];

  bindings.forEach(binding => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-change-case-upper',
      label: 'Change case upper',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Change case upper');

      const block = await logseq.Editor.getCurrentBlock();
      if (block && block.content) {
        const content = block.content;

        await logseq.Editor.updateBlock(block.uuid, cc.upperCase(content));

      }
    });
  });
};
