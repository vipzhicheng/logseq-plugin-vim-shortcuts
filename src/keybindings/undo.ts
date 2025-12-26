import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getNumber, getSettings, resetNumber, isKeyBindingEnabled } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('undo')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.undo)
    ? settings.keyBindings.undo
    : [settings.keyBindings.undo];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-undo-" + index,
        label: "Undo",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Undo");

        const number = getNumber();
        resetNumber();

        for (let i = 0; i < number; i++) {
          // @ts-ignore
          await logseq.App.invokeExternalCommand("logseq.editor/undo");
          await logseq.Editor.exitEditingMode(true);
        }
      }
    );
  });
};
