import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getSettings } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.lineEnd)
    ? settings.keyBindings.lineEnd
    : [settings.keyBindings.lineEnd];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-line-end-" + index,
        label: "Move to line end ($)",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Line end");
        const searchStore = useSearchStore();
        await searchStore.moveLineEnd();
      }
    );
  });
};
