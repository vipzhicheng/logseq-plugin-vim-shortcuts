import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getSettings,
  beforeActionExecute,
  beforeActionRegister,
} from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!beforeActionRegister("right")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.right)
    ? settings.keyBindings.right
    : [settings.keyBindings.right];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-right-" + index,
        label: "Move cursor right",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        // Check before action hook
        if (!beforeActionExecute()) {
          return;
        }

        debug("Move cursor right");
        const searchStore = useSearchStore();
        await searchStore.moveCursorRight();
      }
    );
  });
};
