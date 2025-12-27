import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import * as cc from "change-case-all";
import {
  debug,
  getSettings,
  beforeActionExecute,
  beforeActionRegister,
} from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!beforeActionRegister("changeCaseLower")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.changeCaseLower)
    ? settings.keyBindings.changeCaseLower
    : [settings.keyBindings.changeCaseLower];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-change-case-lower-" + index,
        label: "Change case lower",
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

        debug("Change case lower");

        const searchStore = useSearchStore();
        const block = await logseq.Editor.getCurrentBlock();

        if (!block || !block.content) return;

        const content = block.content;
        let newContent = content;

        // Check if in visual mode or cursor mode with selection
        const visualSelection = searchStore.getVisualSelection();
        if (visualSelection && visualSelection.text) {
          // Replace only the selected text
          const { start, end } = visualSelection;
          const before = content.substring(0, start);
          const selected = content.substring(start, end + 1);
          const after = content.substring(end + 1);

          newContent = before + cc.lowerCase(selected) + after;

          // Exit visual mode after operation
          await searchStore.toggleVisualMode();
        } else if (
          searchStore.cursorMode &&
          searchStore.cursorBlockUUID === block.uuid
        ) {
          // Change case of single character at cursor position
          const pos = searchStore.cursorPosition;
          if (pos >= 0 && pos < content.length) {
            const before = content.substring(0, pos);
            const char = content.charAt(pos);
            const after = content.substring(pos + 1);

            newContent = before + char.toLowerCase() + after;
          }
        } else {
          // Change case of entire block
          newContent = cc.lowerCase(content);
        }

        if (newContent !== content) {
          await logseq.Editor.updateBlock(block.uuid, newContent);

          // Force UI refresh by briefly entering and exiting edit mode
          await logseq.Editor.editBlock(block.uuid);
          await logseq.Editor.exitEditingMode();
        }
      }
    );
  });
};
