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
  if (!beforeActionRegister("insertBefore")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.insertBefore)
    ? settings.keyBindings.insertBefore
    : [settings.keyBindings.insertBefore];

  bindings.forEach((binding, index) => {
    // Determine if this binding has shift modifier (uppercase)
    const isUpperCase = binding.toLowerCase().includes("shift+");
    const key = binding; // Use the actual binding as the key

    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-insert-before-" + index,
        label: isUpperCase
          ? `Enter insert mode at line start (${binding})`
          : `Enter insert mode before cursor (${binding}) or match start if searching`,
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

        debug(`Insert before (${key})`);

        let blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          const searchStore = useSearchStore();

          if (isUpperCase) {
            // Uppercase (with shift) - Always insert at line start
            await logseq.Editor.editBlock(blockUUID, {
              pos: 0,
            });
            // Exit visual mode if active
            if (searchStore.visualMode) {
              searchStore.exitVisualMode();
              searchStore.clearCursor();
            }
          } else {
            // Lowercase (no shift) - Check if we're in visual mode or have a current match
            const currentMatch = searchStore.getCurrentMatch();

            if (
              searchStore.visualMode &&
              searchStore.cursorBlockUUID === blockUUID
            ) {
              // In visual mode - Insert at the selection start
              const selection = searchStore.getVisualSelection();
              if (selection) {
                await logseq.Editor.editBlock(blockUUID, {
                  pos: selection.start,
                });
                searchStore.exitVisualMode();
                searchStore.clearCursor();
              }
            } else if (
              currentMatch &&
              currentMatch.uuid === blockUUID &&
              (searchStore.input || searchStore.cursorMode)
            ) {
              // Insert at the start of the match or cursor position
              await logseq.Editor.editBlock(blockUUID, {
                pos: currentMatch.matchOffset,
              });
            } else {
              // Default behavior: enter edit mode
              await logseq.Editor.editBlock(blockUUID);
            }
          }
        }
      }
    );
  });
};
