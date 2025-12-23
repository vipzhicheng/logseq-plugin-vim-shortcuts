import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getSettings } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.repeatCharSearchReverse)
    ? settings.keyBindings.repeatCharSearchReverse
    : [settings.keyBindings.repeatCharSearchReverse];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-repeat-char-search-reverse-" + index,
        label: "Repeat character search reverse (,)",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Repeat character search reverse");
        const searchStore = useSearchStore();
        await searchStore.repeatCharSearchReverse();
      }
    );
  });
};
