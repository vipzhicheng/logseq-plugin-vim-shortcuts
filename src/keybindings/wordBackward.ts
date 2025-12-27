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
  if (!beforeActionRegister("wordBackward")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.wordBackward)
    ? settings.keyBindings.wordBackward
    : [settings.keyBindings.wordBackward];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-word-backward-" + index,
        label: "Move to previous word (b)",
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

        debug("Word backward");
        const searchStore = useSearchStore();
        await searchStore.moveWordBackward();
      }
    );
  });
};
