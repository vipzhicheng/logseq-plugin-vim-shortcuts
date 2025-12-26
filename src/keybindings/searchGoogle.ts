import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getCurrentBlockUUID, getSettings, isKeyBindingEnabled } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('searchGoogle')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.searchGoogle)
    ? settings.keyBindings.searchGoogle
    : [settings.keyBindings.searchGoogle];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-search-google-" + index,
        label: "Search in Google",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Search in Google");

        const searchStore = useSearchStore();
        let searchText = "";

        // Priority 1: Visual mode selection
        const visualSelection = searchStore.getVisualSelection();
        if (visualSelection && visualSelection.text) {
          searchText = visualSelection.text;
        }
        // Priority 2: Current search highlight
        else if (searchStore.input) {
          searchText = searchStore.input;
        }
        // Priority 3: Entire block content
        else {
          let blockUUID = await getCurrentBlockUUID();
          if (blockUUID) {
            let block = await logseq.Editor.getBlock(blockUUID);
            if (block?.content) {
              searchText = block.content;
            }
          }
        }

        if (searchText) {
          await logseq.App.openExternalLink(
            `https://www.google.com/search?q=${encodeURIComponent(searchText)}`
          );
        }
      }
    );
  });
};
