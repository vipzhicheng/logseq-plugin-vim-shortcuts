import { BlockEntity, ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  clearCurrentPageBlocksHighlight,
  debug,
  getSettings,
} from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const searchBindings = Array.isArray(settings.search)
    ? settings.search
    : [settings.search];

  searchBindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-search-" + index,
        label: "Search",
        keybinding: {
          mode: "global",
          binding,
        },
      },
      async () => {
        debug("Search");
        const searchStore = useSearchStore();
        searchStore.emptyInput();
        searchStore.show();
        logseq.showMainUI({
          autoFocus: true,
        });

        await clearCurrentPageBlocksHighlight();

        const $input = document.querySelector(
          ".search-input input"
        ) as HTMLInputElement;
        setTimeout(() => {
          $input && $input.focus();
        }, 500);
      }
    );
  });

  // Search Next
  const searchNextBindings = Array.isArray(settings.searchNext)
    ? settings.searchNext
    : [settings.searchNext];

  searchNextBindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-search-next-" + index,
        label: "Search Next",
        keybinding: {
          mode: "global",
          binding,
        },
      },
      async () => {
        debug("Search Next");
        await clearCurrentPageBlocksHighlight();
        const searchStore = useSearchStore();
        searchStore.searchNext();
      }
    );
  });

  // Search Prev
  const searchPrevBindings = Array.isArray(settings.searchPrev)
    ? settings.searchPrev
    : [settings.searchPrev];

  searchPrevBindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-search-prev-" + index,
        label: "Search Prev",
        keybinding: {
          mode: "global",
          binding,
        },
      },
      async () => {
        debug("Search Prev");
        await clearCurrentPageBlocksHighlight();
        const searchStore = useSearchStore();
        searchStore.searchPrev();
      }
    );
  });
};
