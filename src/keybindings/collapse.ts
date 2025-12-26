import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getCurrentBlockUUID, getSettings, isKeyBindingEnabled } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('collapse')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.collapse)
    ? settings.keyBindings.collapse
    : [settings.keyBindings.collapse];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-collapse-" + index,
        label: "Collapse block",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Collapse block");

        let blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          await logseq.Editor.setBlockCollapsed(blockUUID, { flag: true });
        }
      }
    );
  });
};
