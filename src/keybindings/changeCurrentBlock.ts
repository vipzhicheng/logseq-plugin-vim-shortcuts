import { BlockEntity, ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getCurrentBlockUUID,
  getSettings,
  writeClipboard,
} from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

const clearBlockAndEdit = async (currentBlock: BlockEntity): Promise<void> => {
  writeClipboard(currentBlock.content);
  await logseq.Editor.updateBlock(currentBlock.uuid, "");
  await logseq.Editor.editBlock(currentBlock.uuid);
};

const deleteMatchAndEdit = async (
  blockUUID: string,
  matchOffset: number,
  matchLength: number
): Promise<void> => {
  const block = await logseq.Editor.getBlock(blockUUID);
  if (block) {
    const matchStart = matchOffset;
    const matchEnd = matchStart + matchLength;

    // Remove the matched text from content
    const newContent =
      block.content.substring(0, matchStart) +
      block.content.substring(matchEnd);

    // Update the block with new content
    await logseq.Editor.updateBlock(blockUUID, newContent);

    // Small delay to ensure the block is updated
    await new Promise(resolve => setTimeout(resolve, 50));

    // Enter edit mode at the match position
    await logseq.Editor.editBlock(blockUUID, {
      pos: matchStart,
    });
  }
};

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.changeCurrentBlock)
    ? settings.keyBindings.changeCurrentBlock
    : [settings.keyBindings.changeCurrentBlock];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-change-current-block-" + index,
        label: "Change current block (or delete match if searching)",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("change current block");

        // First check if we're in search mode with an active match
        const blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          const searchStore = useSearchStore();
          const currentMatch = searchStore.getCurrentMatch();

          // If there's an active search match on this block, delete only the match
          if (currentMatch && currentMatch.uuid === blockUUID && searchStore.input) {
            await deleteMatchAndEdit(blockUUID, currentMatch.matchOffset, searchStore.input.length);
            return;
          }
        }

        // Otherwise, use the original behavior (clear entire block or selection)
        const selected = await logseq.Editor.getSelectedBlocks();
        debug(selected)
        if (selected && selected.length > 1) {
          for (let i = 1; i < selected.length; i++) {
            await logseq.Editor.removeBlock(selected[i].uuid);
          }
          await clearBlockAndEdit(selected[0]);
        } else {
          // normal mode: clear current block, edit current
          if (blockUUID) {
            const currentBlock = await logseq.Editor.getBlock(blockUUID);
            await clearBlockAndEdit(currentBlock);
          }
        }
      }
    );
  });
};
