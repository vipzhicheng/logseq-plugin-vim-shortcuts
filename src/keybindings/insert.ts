import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getCurrentBlockUUID,
  getSettings,
  beforeActionExecute,
  beforeActionRegister,
} from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!beforeActionRegister("insert")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.insert)
    ? settings.keyBindings.insert
    : [settings.keyBindings.insert];

  bindings.forEach((binding, index) => {
    // Determine if this binding has shift modifier (uppercase)
    const isUpperCase = binding.toLowerCase().includes("shift+");
    const key = binding; // Use the actual binding as the key

    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-insert-" + index,
        label: isUpperCase
          ? `Enter insert mode at line end (${binding})`
          : `Enter insert mode after cursor (${binding}) or match end if searching`,
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        // Check before action hook
        if (!beforeActionExecute()) {
          return;
        }

        debug(`Insert (${key})`);

        let blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          const searchStore = useSearchStore();
          const currentMatch = searchStore.getCurrentMatch();

          if (isUpperCase) {
            // Uppercase (with shift) - Insert at line end
            const block = await logseq.Editor.getBlock(blockUUID);
            if (block) {
              await logseq.Editor.editBlock(blockUUID, {
                pos: block.content.length,
              });
              // Exit visual mode if active
              if (searchStore.visualMode) {
                searchStore.exitVisualMode();
                searchStore.clearCursor();
              }
            }
          } else if (
            searchStore.visualMode &&
            searchStore.cursorBlockUUID === blockUUID
          ) {
            // In visual mode - Insert after the selection end
            const selection = searchStore.getVisualSelection();
            if (selection) {
              await logseq.Editor.editBlock(blockUUID, {
                pos: selection.end + 1,
              });
              searchStore.exitVisualMode();
              searchStore.clearCursor();
            }
          } else if (
            currentMatch &&
            currentMatch.uuid === blockUUID &&
            searchStore.input
          ) {
            // Lowercase (no shift) - Insert at the end of the match when searching
            await logseq.Editor.editBlock(blockUUID, {
              pos: currentMatch.matchOffset + searchStore.input.length,
            });
          } else if (
            currentMatch &&
            currentMatch.uuid === blockUUID &&
            searchStore.cursorMode
          ) {
            // Lowercase (no shift) - Insert after cursor position
            await logseq.Editor.editBlock(blockUUID, {
              pos: currentMatch.matchOffset + 1,
            });
          } else {
            // Lowercase (no shift) - Default behavior: enter edit mode
            await logseq.Editor.editBlock(blockUUID);
          }
        }
      }
    );
  });
};
