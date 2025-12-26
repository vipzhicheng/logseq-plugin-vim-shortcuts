import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getCurrentBlockUUID, getSettings, isKeyBindingEnabled } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('extend')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.extend)
    ? settings.keyBindings.extend
    : [settings.keyBindings.extend];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-extend-" + index,
        label: "Extend block",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Extend block");

        let blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          await logseq.Editor.setBlockCollapsed(blockUUID, { flag: false });
        }
      }
    );
  });
};
