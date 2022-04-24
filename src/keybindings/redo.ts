import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getNumber, getSettings, resetNumber } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.redo)
    ? settings.keyBindings.redo
    : [settings.keyBindings.redo];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-redo-" + index,
        label: "Redo",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("redo");

        const number = getNumber();
        resetNumber();

        for (let i = 0; i < number; i++) {
          // @ts-ignore
          await logseq.App.invokeExternalCommand("logseq.editor/redo");
          await logseq.Editor.exitEditingMode(true);
        }
      }
    );
  });
};
