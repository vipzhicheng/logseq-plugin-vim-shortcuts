import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getCurrentBlockUUID, getSettings, isKeyBindingEnabled } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('searchStackoverflow')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.searchStackoverflow)
    ? settings.keyBindings.searchStackoverflow
    : [settings.keyBindings.searchStackoverflow];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-search-stackoverflow-" + index,
        label: "Search in Stackoverflow",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Search in Stackoverflow");
        let blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          let block = await logseq.Editor.getBlock(blockUUID);
          if (block?.content) {
            await logseq.App.openExternalLink(
              `http://stackoverflow.com/search?q=${block.content}`
            );
          }
        }
      }
    );
  });
};
