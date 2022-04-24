import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getNumber,
  getSettings,
  getVisualMode,
  resetNumber,
} from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.up)
    ? settings.keyBindings.up
    : [settings.keyBindings.up];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-up-" + index,
        label: "up",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        const number = getNumber();
        resetNumber();

        const visualMode = getVisualMode();

        if (visualMode) {
          debug("Select up");
          for (let i = 0; i < number; i++) {
            await logseq.App.invokeExternalCommand(
              // @ts-ignore
              "logseq.editor/select-block-up"
            );
          }
        } else {
          debug("Up");
          for (let i = 0; i < number; i++) {
            // @ts-ignore
            await logseq.App.invokeExternalCommand("logseq.editor/up");
          }
        }
      }
    );
  });
};
