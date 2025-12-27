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
  if (!beforeActionRegister("toggleVisualMode")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.toggleVisualMode)
    ? settings.keyBindings.toggleVisualMode
    : [settings.keyBindings.toggleVisualMode];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-toggleVisualMode-" + index,
        label: "Toggle visual selection mode",
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

        debug("Toggle visual selection mode");
        const searchStore = useSearchStore();
        await searchStore.toggleVisualMode();
      }
    );
  });
};
