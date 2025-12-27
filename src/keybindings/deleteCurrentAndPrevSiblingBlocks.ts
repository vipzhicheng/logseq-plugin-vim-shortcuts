import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getCurrentBlockUUID,
  getCurrentPage,
  getNumber,
  getSettings,
  resetNumber,
  scrollToBlockInPage,
  writeClipboard,
  beforeActionExecute,
  beforeActionRegister,
} from "@/common/funcs";

const deleteCurrentAndPrevSiblingBlocks = async (number: number) => {
  const page = await getCurrentPage();
  if (page?.name) {
    let blockUUID = await getCurrentBlockUUID();
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);
      if (block?.uuid) {
        let nextBlock = await logseq.Editor.getNextSiblingBlock(
          block.uuid as string
        );
        let prevBlock, currentBlock;
        currentBlock = block;

        for (let i = 0; i <= number; i++) {
          writeClipboard(currentBlock.content);
          prevBlock = await logseq.Editor.getPreviousSiblingBlock(
            currentBlock.uuid
          );
          await logseq.Editor.removeBlock(currentBlock.uuid);
          if (!prevBlock) {
            break;
          } else {
            currentBlock = prevBlock;
          }
        }

        let focusBlock = nextBlock || prevBlock || null;
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
        let nextBlock = await logseq.Editor.getPreviousSiblingBlock(
          block.uuid as string
        );
        let prevBlock, currentBlock;
        currentBlock = block;

        for (let i = 0; i <= number; i++) {
          writeClipboard(currentBlock.content);
          prevBlock = await logseq.Editor.getNextSiblingBlock(
            currentBlock.uuid
          );
          await logseq.Editor.removeBlock(currentBlock.uuid);
          if (!prevBlock) {
            break;
          } else {
            currentBlock = prevBlock;
          }
        }

        let focusBlock = nextBlock || prevBlock || null;
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
  if (!beforeActionRegister("deleteCurrentAndPrevSiblingBlocks")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(
    settings.keyBindings.deleteCurrentAndPrevSiblingBlocks
  )
    ? settings.keyBindings.deleteCurrentAndPrevSiblingBlocks
    : [settings.keyBindings.deleteCurrentAndPrevSiblingBlocks];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-delete-current-and-prev-blocks-" + index,
        label: "Delete current and prev blocks",
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

        debug("delete current and prev blocks");

        const number = getNumber();
        resetNumber();

        await deleteCurrentAndPrevSiblingBlocks(number);
      }
    );
  });
};
