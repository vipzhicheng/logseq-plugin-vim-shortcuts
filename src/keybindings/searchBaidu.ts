import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getCurrentBlockUUID, getSettings, isKeyBindingEnabled } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('searchBaidu')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.searchBaidu)
    ? settings.keyBindings.searchBaidu
    : [settings.keyBindings.searchBaidu];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-search-baidu-" + index,
        label: "Search in Baidu",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Search in Baidu");
        let blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          let block = await logseq.Editor.getBlock(blockUUID);
          if (block?.content) {
            await logseq.App.openExternalLink(
              `https://www.baidu.com/s?wd=${block.content}`
            );
          }
        }
      }
    );
  });
};
