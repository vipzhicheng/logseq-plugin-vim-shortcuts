import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug,
  getCurrentBlockUUID,
  getCurrentPage,
  getSettings,
  scrollToBlockInPage, isKeyBindingEnabled } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('highlightFocusOut')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.highlightFocusOut)
    ? settings.keyBindings.highlightFocusOut
    : [settings.keyBindings.highlightFocusOut];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-highlightFocusOut-" + index,
        label: "Highlight focus out",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Highlight focus out");

        const page = await getCurrentPage();
        if (page?.name) {
          let blockUUID = await getCurrentBlockUUID();
          if (blockUUID) {
            let block = await logseq.Editor.getBlock(blockUUID);
            if (block?.parent.id) {
              const parentBlock = await logseq.Editor.getBlock(
                block?.parent.id
              );
              if (parentBlock?.uuid) {
                scrollToBlockInPage(page.name as string, parentBlock?.uuid);
              }
            }
          }
        }
      }
    );
  });
};
