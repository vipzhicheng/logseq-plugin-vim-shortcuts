import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug,
  getNumber,
  getSettings,
  resetNumber, isKeyBindingEnabled } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('up')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.up)
    ? settings.keyBindings.up
    : [settings.keyBindings.up];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-up-" + index,
        label: "up or move cursor up",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        const searchStore = useSearchStore();

        // If in cursor mode, move cursor up (to previous block)
        if (searchStore.cursorMode) {
          debug("Move cursor up");
          await searchStore.moveCursorUp();
          return;
        }

        const number = getNumber();
        resetNumber();

        debug("Up");
        for (let i = 0; i < number; i++) {
          // @ts-ignore
          await logseq.App.invokeExternalCommand("logseq.editor/up");
        }
      }
    );
  });
};
