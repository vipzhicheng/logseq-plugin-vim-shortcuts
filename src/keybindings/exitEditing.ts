import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getSettings,
  beforeActionExecute,
  beforeActionRegister,
} from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!beforeActionRegister("exitEditing")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.exitEditing)
    ? settings.keyBindings.exitEditing
    : [settings.keyBindings.exitEditing];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-exit-editing-" + index,
        label: "Exit editing",
        keybinding: {
          mode: "global",
          binding,
        },
      },
      async () => {
        // Check before action hook
        if (!beforeActionExecute()) {
          return;
        }

        debug("Exit editing");
        await logseq.Editor.exitEditingMode(true);
      }
    );
  });
};
