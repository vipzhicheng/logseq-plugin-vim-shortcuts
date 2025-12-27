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
  if (!beforeActionRegister("wordForward")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.wordForward)
    ? settings.keyBindings.wordForward
    : [settings.keyBindings.wordForward];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-word-forward-" + index,
        label: "Move to next word (w)",
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

        debug("Word forward");
        const searchStore = useSearchStore();
        await searchStore.moveWordForward();
      }
    );
  });
};
