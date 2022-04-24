import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getCurrentPage,
  getSettings,
  scrollToBlockInPage,
} from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.top)
    ? settings.keyBindings.top
    : [settings.keyBindings.top];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-top-" + index,
        label: "Go to current page top",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("top");
        const page = await getCurrentPage();
        if (page?.name) {
          const blocks = await logseq.Editor.getPageBlocksTree(page?.name);
          if (blocks.length > 0) {
            let block = blocks[0];
            scrollToBlockInPage(page.name, block.uuid);
          }
        }
      }
    );
  });
};
