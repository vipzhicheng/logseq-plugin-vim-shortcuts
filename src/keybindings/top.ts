import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug,
  getCurrentPage,
  getSettings,
  scrollToBlockInPage, isKeyBindingEnabled } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('top')) {
    return;
  }

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
          const blocks = await logseq.Editor.getPageBlocksTree(page?.name as string);
          if (blocks.length > 0) {
            let block = blocks[0];
            scrollToBlockInPage(page.name as string, block.uuid as string);
          }
        }
      }
    );
  });
};
