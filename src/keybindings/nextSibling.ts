import {
  ILSPluginUser,
  BlockEntity,
  PageEntity,
  BlockUUID,
} from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getCurrentBlockUUID,
  getCurrentPage,
  getNumber,
  getSettings,
  getVisualMode,
  resetNumber,
  scrollToBlockInPage,
} from "@/common/funcs";

const findNextBlockRecur = async (
  page: PageEntity | BlockEntity,
  block: BlockEntity
) => {
  if (block.parent.id) {
    const parentBlock = await logseq.Editor.getBlock(block.parent.id);
    if (parentBlock?.uuid) {
      const parentNextBlock = await logseq.Editor.getNextSiblingBlock(
        parentBlock?.uuid
      );
      if (parentNextBlock?.uuid) {
        scrollToBlockInPage(page.name, parentNextBlock.uuid);
      } else if (parentBlock.parent.id) {
        await findNextBlockRecur(page, parentBlock);
      }
    }
  }
};

const goNextSibling = async (lastBlockUUID: BlockUUID | undefined) => {
  const page = await getCurrentPage();

  if (page?.name) {
    let blockUUID = lastBlockUUID || (await getCurrentBlockUUID());
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);
      if (block?.uuid) {
        const nextBlock = await logseq.Editor.getNextSiblingBlock(block.uuid);
        if (nextBlock?.uuid) {
          scrollToBlockInPage(page.name, nextBlock.uuid);
          return nextBlock?.uuid;
        } else if (block.parent.id) {
          await findNextBlockRecur(page, block);
        }
      }
    }
  } else {
    let blockUUID = lastBlockUUID || (await getCurrentBlockUUID());
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);
      const page = await logseq.Editor.getPage(block.page.id);
      if (block?.uuid) {
        const nextBlock = await logseq.Editor.getNextSiblingBlock(block.uuid);
        if (nextBlock?.uuid) {
          scrollToBlockInPage(page.name, nextBlock.uuid);
          return nextBlock?.uuid;
        } else if (block.parent.id) {
          await findNextBlockRecur(page, block);
        }
      }
    }
  }
};

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.nextSibling)
    ? settings.keyBindings.nextSibling
    : [settings.keyBindings.nextSibling];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-next-sibling-" + index,
        label: "Go to next sibling",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        const number = getNumber();
        resetNumber();

        const visualMode = getVisualMode();

        if (visualMode) {
          debug("Move block down");
          for (let i = 0; i < number; i++) {
            await logseq.App.invokeExternalCommand(
              // @ts-ignore
              "logseq.editor/move-block-down"
            );
          }
        } else {
          debug("Next sibling");
          let lastBlockUUID: BlockUUID | undefined;
          for (let i = 0; i < number; i++) {
            // @ts-ignore
            lastBlockUUID = await goNextSibling(lastBlockUUID);
          }
        }
      }
    );
  });
};
