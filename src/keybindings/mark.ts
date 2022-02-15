import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentPage, getMark, getNumber, getSettings, resetNumber, scrollToBlockInPage, setMark } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindingsMarkSave = Array.isArray(settings.markSave) ? settings.markSave : [settings.markSave];
  const bindingsMarkJump = Array.isArray(settings.markJump) ? settings.markJump : [settings.markJump];
  const bindingsMarkJumpSidebar = Array.isArray(settings.markJumpSidebar) ? settings.markJumpSidebar : [settings.markJumpSidebar];

  bindingsMarkSave.forEach(binding => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-save-mark',
      label: 'Save mark',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Save mark');

      const number = getNumber();
      resetNumber();

      const page = await getCurrentPage();
      if (page?.name) {
        const block = await logseq.Editor.getCurrentBlock();
        if (block?.uuid) {
          setMark(number, page.name, block.uuid);
        } else {
          setMark(number, page.name);
        }
      }
    });
  });

  bindingsMarkJump.forEach(binding => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-jump-mark',
      label: 'Jump mark',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Jump mark');

      const number = getNumber();
      resetNumber();

      const mark = getMark(number);

      if (mark) {

        if (mark.block) {
          logseq.Editor.scrollToBlockInPage(mark.page, mark.block);
        } else {
          logseq.App.pushState('page', {
            name: mark.page
          });
        }
      }
    });
  });

  bindingsMarkJumpSidebar.forEach(binding => {
    logseq.App.registerCommandPalette({
      key: 'vim-shortcut-jump-mark-sidebar',
      label: 'Jump mark to sidebar',
      keybinding: {
        mode: 'non-editing',
        binding
      }
    }, async () => {
      debug('Jump mark to sidebar');

      const number = getNumber();
      resetNumber();

      const mark = getMark(number);

      if (mark) {
        if (mark.block) {
          logseq.App.openInRightSidebar(mark.block);
        } else {
          const page = await logseq.Editor.getPage(mark.page);
          if (page?.uuid) {
            logseq.App.openInRightSidebar(page.uuid);
          }
        }
      }

    });
  });
};
