import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug,
  getNumber,
  getSettings,
  resetNumber, isKeyBindingEnabled } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('down')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.down)
    ? settings.keyBindings.down
    : [settings.keyBindings.down];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-down-" + index,
        label: "down or move cursor down",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        const searchStore = useSearchStore();

        // If in cursor mode, move cursor down (to next block)
        if (searchStore.cursorMode) {
          debug("Move cursor down");
          await searchStore.moveCursorDown();
          return;
        }

        const number = getNumber();
        resetNumber();

        debug("Down");
        for (let i = 0; i < number; i++) {
          // @ts-ignore
          await logseq.App.invokeExternalCommand("logseq.editor/down");
        }
      }
    );
  });
};
