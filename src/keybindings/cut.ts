import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getCurrentBlockUUID,
  getSettings,
  writeClipboard,
  beforeActionExecute,
  beforeActionRegister,
} from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

const deleteTextAndCopy = async (
  blockUUID: string,
  deleteStart: number,
  deleteLength: number
): Promise<void> => {
  const block = await logseq.Editor.getBlock(blockUUID);
  if (block) {
    const deleteEnd = deleteStart + deleteLength;

    // Copy the deleted text to clipboard
    const deletedText = block.content.substring(deleteStart, deleteEnd);
    writeClipboard(deletedText);

    // Remove the text from content
    const newContent =
      block.content.substring(0, deleteStart) +
      block.content.substring(deleteEnd);

    // Update the block with new content
    await logseq.Editor.updateBlock(blockUUID, newContent);

    // Force UI refresh by briefly entering and exiting edit mode
    await logseq.Editor.editBlock(blockUUID);
    // Small delay to ensure the block is updated before exiting
    await new Promise((resolve) => setTimeout(resolve, 50));
    await logseq.Editor.exitEditingMode();

    // Restore cursor position after cut
    const searchStore = useSearchStore();
    if (searchStore.cursorMode && searchStore.cursorBlockUUID === blockUUID) {
      // Update block content in store
      searchStore.cursorBlockContent = newContent;

      // Adjust cursor position after deletion
      // If cursor was after the deleted section, move it back
      if (searchStore.cursorPosition >= deleteEnd) {
        searchStore.cursorPosition = searchStore.cursorPosition - deleteLength;
      }
      // If cursor was at the deletion point or within deleted range, keep it at deleteStart
      else if (searchStore.cursorPosition >= deleteStart) {
        searchStore.cursorPosition = deleteStart;
      }

      // Ensure cursor doesn't go beyond content length
      if (
        searchStore.cursorPosition >= newContent.length &&
        newContent.length > 0
      ) {
        searchStore.cursorPosition = newContent.length - 1;
      }

      // Restore cursor highlight by moving right then left (triggers highlight refresh)
      await searchStore.moveCursorRight();
      await searchStore.moveCursorLeft();
    }
  }
};

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!beforeActionRegister("cut")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.cut)
    ? settings.keyBindings.cut
    : [settings.keyBindings.cut];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-cut-" + index,
        label: "Cut",
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

        debug("cut");

        const blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          const searchStore = useSearchStore();
          const currentMatch = searchStore.getCurrentMatch();

          // Priority 1: Visual mode selection
          if (
            searchStore.visualMode &&
            searchStore.cursorBlockUUID === blockUUID
          ) {
            const selection = searchStore.getVisualSelection();
            if (selection) {
              const length = selection.end - selection.start + 1;
              await deleteTextAndCopy(blockUUID, selection.start, length);
              searchStore.exitVisualMode();
              return;
            }
          }

          // Priority 2: Search mode - cut the search match
          if (
            currentMatch &&
            currentMatch.uuid === blockUUID &&
            searchStore.input
          ) {
            await deleteTextAndCopy(
              blockUUID,
              currentMatch.matchOffset,
              searchStore.input.length
            );
            return;
          }

          // Priority 3: Cursor mode - cut single character at cursor position
          if (
            searchStore.cursorMode &&
            searchStore.cursorBlockUUID === blockUUID
          ) {
            const pos = searchStore.cursorPosition;
            const block = await logseq.Editor.getBlock(blockUUID);
            if (block && pos >= 0 && pos < block.content.length) {
              await deleteTextAndCopy(blockUUID, pos, 1);
              return;
            }
          }
        }

        // Priority 4: Original behavior - cut first character of block(s)
        const selected = await logseq.Editor.getSelectedBlocks();
        if (selected.length > 1) {
          for (let block of selected) {
            if (block.content.length > 0) {
              const content = block.content.substring(1);
              writeClipboard(block.content.charAt(0));
              await logseq.Editor.updateBlock(block.uuid, content);
            }
          }
        } else {
          const block = await logseq.Editor.getCurrentBlock();
          if (block && block.content.length > 0) {
            const content = block.content.substring(1);
            writeClipboard(block.content.charAt(0));
            await logseq.Editor.updateBlock(block.uuid, content);
          }
        }
      }
    );
  });
};
