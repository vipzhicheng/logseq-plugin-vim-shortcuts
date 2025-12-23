import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getSettings } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.findChar)
    ? settings.keyBindings.findChar
    : [settings.keyBindings.findChar];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-find-char-" + index,
        label: "Find character (f)",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Find character");
        const searchStore = useSearchStore();
        searchStore.startCharSearch("f");
      }
    );
  });
};
