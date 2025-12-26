import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getSettings, isKeyBindingEnabled } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('findCharBackward')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.findCharBackward)
    ? settings.keyBindings.findCharBackward
    : [settings.keyBindings.findCharBackward];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-find-char-backward-" + index,
        label: "Find character backward (F)",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Find character backward");
        const searchStore = useSearchStore();
        searchStore.startCharSearch("F");
      }
    );
  });
};
