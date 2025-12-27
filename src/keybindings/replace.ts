import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getSettings,
  beforeActionExecute,
  beforeActionRegister,
  setWaitingForInput,
} from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!beforeActionRegister("replace")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.replace)
    ? settings.keyBindings.replace
    : [settings.keyBindings.replace];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-replace-" + index,
        label: "Replace character",
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

        debug("Replace character");

        const searchStore = useSearchStore();

        // Must be in cursor mode to use replace
        if (!searchStore.cursorMode) {
          logseq.UI.showMsg("Replace requires cursor mode", "warning");
          return;
        }

        const blockUUID = await logseq.Editor.getCurrentBlock().then(
          (b) => b?.uuid
        );
        if (!blockUUID || searchStore.cursorBlockUUID !== blockUUID) return;

        const block = await logseq.Editor.getBlock(blockUUID);
        if (!block || !block.content) return;

        // Show message to prompt user for replacement character
        logseq.UI.showMsg("Type a character to replace with...", "info");

        // Set up one-time keyboard listener for the replacement character
        const handleKeyPress = async (e: KeyboardEvent) => {
          // Ignore modifier keys
          if (
            e.key.length > 1 &&
            !["Enter", "Space", "Escape"].includes(e.key)
          ) {
            return;
          }

          e.preventDefault();
          e.stopPropagation();

          // Remove the listener and clear waiting state
          top!.document.removeEventListener("keydown", handleKeyPress, true);
          setWaitingForInput(false);

          let replacementChar = e.key;

          // Handle special keys
          if (e.key === "Enter") {
            replacementChar = "\n";
          } else if (e.key === "Space") {
            replacementChar = " ";
          } else if (e.key === "Escape") {
            logseq.UI.showMsg("Replace cancelled", "warning");
            return;
          }

          // Get the latest block content
          const currentBlock = await logseq.Editor.getBlock(blockUUID);
          if (!currentBlock) return;

          const content = currentBlock.content;
          let newContent: string;
          let isVisualMode = false;

          // Check if in visual mode
          if (searchStore.visualMode) {
            const selection = searchStore.getVisualSelection();
            if (selection) {
              const { start, end } = selection;
              const length = end - start + 1;

              // Replace all selected characters with the replacement character
              const beforeText = content.substring(0, start);
              const replacementText = replacementChar.repeat(length);
              const afterText = content.substring(end + 1);

              newContent = beforeText + replacementText + afterText;
              isVisualMode = true;
            } else {
              return;
            }
          } else {
            // Replace single character at cursor position
            const pos = searchStore.cursorPosition;
            if (pos >= 0 && pos < content.length) {
              const beforeText = content.substring(0, pos);
              const afterText = content.substring(pos + 1);

              newContent = beforeText + replacementChar + afterText;
            } else {
              return;
            }
          }

          if (newContent !== undefined) {
            // Update the block
            await logseq.Editor.updateBlock(blockUUID, newContent);

            // Force UI refresh
            await logseq.Editor.editBlock(blockUUID);
            await new Promise((resolve) => setTimeout(resolve, 50));
            await logseq.Editor.exitEditingMode();

            // Exit visual mode if it was active
            if (isVisualMode) {
              searchStore.exitVisualMode();
            }

            // Update cursor position and restore highlight
            if (
              searchStore.cursorMode &&
              searchStore.cursorBlockUUID === blockUUID
            ) {
              searchStore.cursorBlockContent = newContent;

              // Restore cursor highlight by moving right then left
              await searchStore.moveCursorRight();
              await searchStore.moveCursorLeft();
            }
          }
        };

        // Set waiting for input state with cleanup function
        const cleanup = () => {
          top!.document.removeEventListener("keydown", handleKeyPress, true);
        };
        setWaitingForInput(true, cleanup);

        // Add keyboard listener with capture phase to intercept the key
        top!.document.addEventListener("keydown", handleKeyPress, true);
      }
    );
  });
};
