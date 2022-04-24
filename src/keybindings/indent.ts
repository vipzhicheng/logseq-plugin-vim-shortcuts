import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getNumber, getSettings, resetNumber } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.indent)
    ? settings.keyBindings.indent
    : [settings.keyBindings.indent];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-indent-" + index,
        label: "indent",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Indent");

        // @ts-ignore
        await logseq.App.invokeExternalCommand("logseq.editor/indent");
      }
    );
  });
};
