import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getSettings, isKeyBindingEnabled } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('repeatCharSearch')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.repeatCharSearch)
    ? settings.keyBindings.repeatCharSearch
    : [settings.keyBindings.repeatCharSearch];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-repeat-char-search-" + index,
        label: "Repeat character search (;)",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Repeat character search");
        const searchStore = useSearchStore();
        await searchStore.repeatCharSearch();
      }
    );
  });
};
