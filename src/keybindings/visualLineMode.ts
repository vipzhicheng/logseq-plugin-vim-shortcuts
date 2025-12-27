import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getSettings, isKeyBindingEnabled } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled("visualLineMode")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.visualLineMode)
    ? settings.keyBindings.visualLineMode
    : [settings.keyBindings.visualLineMode];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-visual-line-mode-" + index,
        label: "Visual line selection mode (select entire line)",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        console.log("here");
        debug("Visual line selection mode");

        const searchStore = useSearchStore();

        // Must be in cursor mode to enter visual mode
        if (!searchStore.cursorMode) {
          logseq.UI.showMsg("Visual line mode requires cursor mode", "warning");
          return;
        }

        const blockUUID = await logseq.Editor.getCurrentBlock().then(
          (b) => b?.uuid
        );
        if (!blockUUID || searchStore.cursorBlockUUID !== blockUUID) return;

        const block = await logseq.Editor.getBlock(blockUUID);
        if (!block || !block.content) return;

        // Enter visual mode and select entire line
        searchStore.visualMode = true;
        searchStore.visualStartPosition = 0;
        searchStore.visualEndPosition = Math.max(0, block.content.length - 1);

        // Update the visual selection highlight
        await searchStore.updateVisualSelection();
      }
    );
  });
};
