import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getCurrentBlockUUID, getSettings, isKeyBindingEnabled } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('searchWikipedia')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.searchWikipedia)
    ? settings.keyBindings.searchWikipedia
    : [settings.keyBindings.searchWikipedia];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-search-wikipedia-" + index,
        label: "Search in Wikipedia",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Search in Wikipedia");
        let blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          let block = await logseq.Editor.getBlock(blockUUID);
          if (block?.content) {
            await logseq.App.openExternalLink(
              `https://en.wikipedia.org/wiki/${block.content}`
            );
          }
        }
      }
    );
  });
};
