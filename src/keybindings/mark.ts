import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getCurrentPage,
  getBlockMark,
  getPageMark,
  getBlockMarks,
  getPageMarks,
  getNumber,
  getSettings,
  hasExplicitNumber,
  resetNumber,
  setMark,
} from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindingsMarkSave = Array.isArray(settings.keyBindings.markSave)
    ? settings.keyBindings.markSave
    : [settings.keyBindings.markSave];
  const bindingsMarkPageSave = Array.isArray(settings.keyBindings.markPageSave)
    ? settings.keyBindings.markPageSave
    : [settings.keyBindings.markPageSave];
  const bindingsMarkJump = Array.isArray(settings.keyBindings.markJump)
    ? settings.keyBindings.markJump
    : [settings.keyBindings.markJump];
  const bindingsMarkJumpSidebar = Array.isArray(
    settings.keyBindings.markJumpSidebar
  )
    ? settings.keyBindings.markJumpSidebar
    : [settings.keyBindings.markJumpSidebar];
  const bindingsMarkPageJump = Array.isArray(settings.keyBindings.markPageJump)
    ? settings.keyBindings.markPageJump
    : [settings.keyBindings.markPageJump];
  const bindingsMarkPageJumpSidebar = Array.isArray(
    settings.keyBindings.markPageJumpSidebar
  )
    ? settings.keyBindings.markPageJumpSidebar
    : [settings.keyBindings.markPageJumpSidebar];

  bindingsMarkSave.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-save-mark-" + index,
        label: "Save mark",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Save mark");

        let number = getNumber();
        const explicitNumber = hasExplicitNumber();
        resetNumber();

        // If no explicit number was provided, find the next available mark number
        if (!explicitNumber) {
          const marks = getBlockMarks();
          const markNumbers = Object.keys(marks).map(key => parseInt(key, 10)).filter(n => !isNaN(n));

          if (markNumbers.length > 0) {
            // Find the maximum number and add 1
            number = Math.max(...markNumbers) + 1;
          } else {
            // No marks exist, start from 1
            number = 1;
          }
        }

        const page = await getCurrentPage();
        if (page?.name) {
          const block = await logseq.Editor.getCurrentBlock();
          const selected = await logseq.Editor.getSelectedBlocks();

          // 1. current block uuid exist
          // 2. current block page id === current page id
          // 3. current block is selected and only current block is selected
          if (
            block?.uuid &&
            block.page.id === page.id &&
            selected &&
            selected.length === 1 &&
            selected[0].uuid === block.uuid
          ) {
            if (!block?.properties?.id) {
              await logseq.Editor.upsertBlockProperty(
                block.uuid,
                "id",
                block.uuid
              );
            }
            await setMark(number, page.name as string, block.uuid as string);
            logseq.UI.showMsg(`Mark ${number} saved`);
          } else {
            await setMark(number, page.name as string);
            logseq.UI.showMsg(`Mark ${number} saved`);
          }
        }
      }
    );
  });

  bindingsMarkJump.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-jump-mark-" + index,
        label: "Jump mark",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Jump mark");

        const number = getNumber();
        resetNumber();

        const mark = getBlockMark(number);

        if (mark) {
          logseq.Editor.scrollToBlockInPage(mark.page, mark.block);
        }
      }
    );
  });

  bindingsMarkJumpSidebar.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-jump-mark-sidebar-" + index,
        label: "Jump mark to sidebar",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Jump mark to sidebar");

        const number = getNumber();
        resetNumber();

        const mark = getBlockMark(number);

        if (mark) {
          logseq.Editor.openInRightSidebar(mark.block);
        }
      }
    );
  });

  // Mark Page Save (M key)
  bindingsMarkPageSave.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-save-page-mark-" + index,
        label: "Save page mark",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Save page mark");

        let number = getNumber();
        const explicitNumber = hasExplicitNumber();
        resetNumber();

        // If no explicit number was provided, find the next available mark number
        if (!explicitNumber) {
          const marks = getPageMarks();
          const markNumbers = Object.keys(marks)
            .map(key => parseInt(key, 10))
            .filter(n => !isNaN(n));

          if (markNumbers.length > 0) {
            number = Math.max(...markNumbers) + 1;
          } else {
            number = 1;
          }
        }

        const page = await getCurrentPage();
        if (page?.name) {
          await setMark(number, page.name as string); // No block UUID - page only
          logseq.UI.showMsg(`Page mark ${number} saved`);
        }
      }
    );
  });

  // Mark Page Jump (" key)
  bindingsMarkPageJump.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-jump-page-mark-" + index,
        label: "Jump to page mark",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Jump to page mark");

        const number = getNumber();
        resetNumber();

        const mark = getPageMark(number);

        if (mark) {
          logseq.App.pushState("page", {
            name: mark.page,
          });
        }
      }
    );
  });

  // Mark Page Jump to Sidebar (mod+shift+' key)
  bindingsMarkPageJumpSidebar.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-jump-page-mark-sidebar-" + index,
        label: "Jump to page mark in sidebar",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Jump to page mark in sidebar");

        const number = getNumber();
        resetNumber();

        const mark = getPageMark(number);

        if (mark) {
          const page = await logseq.Editor.getPage(mark.page);
          if (page?.uuid) {
            await logseq.Editor.openInRightSidebar(page.uuid);
          }
        }
      }
    );
  });
};
