import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getSettings, isKeyBindingEnabled } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('outdent')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.outdent)
    ? settings.keyBindings.outdent
    : [settings.keyBindings.outdent];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-outdent-" + index,
        label: "outdent",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Outdent");

        // @ts-ignore
        await logseq.App.invokeExternalCommand("logseq.editor/outdent");
      }
    );
  });
};
