import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getCurrentPage,
  getSettings,
  scrollToBlockInPage,
} from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.bottom)
    ? settings.keyBindings.bottom
    : [settings.keyBindings.bottom];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-bottom-" + index,
        label: "Go to current page bottom",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("bottom");
        const page = await getCurrentPage();
        if (page?.name) {
          const blocks = await logseq.Editor.getPageBlocksTree(page?.name);
          if (blocks.length > 0) {
            let block = blocks[blocks.length - 1];
            scrollToBlockInPage(page.name, block.uuid);
          }
        }
      }
    );
  });
};
