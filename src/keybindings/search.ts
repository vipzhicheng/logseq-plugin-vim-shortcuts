import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getSettings } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.search)
    ? settings.search
    : [settings.search];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-search-" + index,
        label: "Search",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Search");
        const searchStore = useSearchStore();
        searchStore.show();
        logseq.showMainUI({
          autoFocus: true,
        });

        const $input = document.querySelector(
          ".search-input input"
        ) as HTMLInputElement;
        setTimeout(() => {
          $input && $input.focus();
        }, 500);
        // // @ts-ignore
        // await logseq.App.invokeExternalCommand('logseq.go/search-in-page');
      }
    );
  });
};
