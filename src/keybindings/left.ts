import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getSettings, isKeyBindingEnabled } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('left')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.left)
    ? settings.keyBindings.left
    : [settings.keyBindings.left];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-left-" + index,
        label: "Move cursor left",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Move cursor left");
        const searchStore = useSearchStore();
        await searchStore.moveCursorLeft();
      }
    );
  });
};
