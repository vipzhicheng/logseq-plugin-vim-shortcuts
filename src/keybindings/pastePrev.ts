import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug,
  getCurrentBlockUUID,
  getSettings,
  readClipboard, isKeyBindingEnabled } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('pastePrev')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.pastePrev)
    ? settings.keyBindings.pastePrev
    : [settings.keyBindings.pastePrev];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-paste-prev-" + index,
        label: "Paste to prev block",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Paste to prev block");
        let blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          let block = await logseq.Editor.getBlock(blockUUID);
          if (block?.uuid) {
            await logseq.Editor.insertBlock(block.uuid, readClipboard(), {
              before: true,
              sibling: true,
            });
          }
        }
      }
    );
  });
};
