import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug,
  getCurrentBlockUUID,
  getCurrentPage,
  getNumber,
  getSettings,
  resetNumber,
  scrollToBlockInPage,
  writeClipboard, isKeyBindingEnabled } from "@/common/funcs";

const deleteCurrentAndNextSiblingBlocks = async (number: number) => {
  const page = await getCurrentPage();
  if (page?.name) {
    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);
      if (block?.uuid) {
        let prevBlock = await logseq.Editor.getPreviousSiblingBlock(block.uuid as string);
        let nextBlock, currentBlock;
        currentBlock = block;

        for (let i = 0; i <= number; i++) {
          writeClipboard(currentBlock.content);
          nextBlock = await logseq.Editor.getNextSiblingBlock(
            currentBlock.uuid
          );
          await logseq.Editor.removeBlock(currentBlock.uuid);
          if (!nextBlock) {
            break;
          } else {
            currentBlock = nextBlock;
          }
        }

        let focusBlock = prevBlock || nextBlock || null;
        if (focusBlock?.uuid) {
          scrollToBlockInPage(page.name as string, focusBlock.uuid);
        } else if (block.left.id) {
          const parentBlock = await logseq.Editor.getBlock(block.left.id);
          if (parentBlock?.uuid) {
            scrollToBlockInPage(page.name as string, parentBlock.uuid);
          }
        }
      }
    }
  } else {
    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);
      if (block?.uuid) {
        let prevBlock = await logseq.Editor.getPreviousSiblingBlock(block.uuid as string);
        let nextBlock, currentBlock;
        currentBlock = block;

        for (let i = 0; i <= number; i++) {
          writeClipboard(currentBlock.content);
          nextBlock = await logseq.Editor.getNextSiblingBlock(
            currentBlock.uuid
          );
          await logseq.Editor.removeBlock(currentBlock.uuid);
          if (!nextBlock) {
            break;
          } else {
            currentBlock = nextBlock;
          }
        }

        let focusBlock = prevBlock || nextBlock || null;
        if (focusBlock?.uuid) {
          await logseq.Editor.editBlock(focusBlock.uuid);
          await logseq.Editor.exitEditingMode(true);
        } else if (block.left.id) {
          const parentBlock = await logseq.Editor.getBlock(block.left.id);
          if (parentBlock?.uuid) {
            await logseq.Editor.editBlock(parentBlock.uuid);
            await logseq.Editor.exitEditingMode(true);
          }
        }
      }
    }
  }
};

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('deleteCurrentAndNextSiblingBlocks')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(
    settings.keyBindings.deleteCurrentAndNextSiblingBlocks
  )
    ? settings.keyBindings.deleteCurrentAndNextSiblingBlocks
    : [settings.keyBindings.deleteCurrentAndNextSiblingBlocks];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-delete-current-and-next-blocks-" + index,
        label: "Delete current and next blocks",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("delete current and next blocks");

        const number = getNumber();
        resetNumber();

        await deleteCurrentAndNextSiblingBlocks(number);
      }
    );
  });
};
