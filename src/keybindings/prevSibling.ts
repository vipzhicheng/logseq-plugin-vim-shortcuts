import { BlockUUID, ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
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

const goPrevSibling = async (lastBlockUUID: BlockUUID | undefined) => {
  const page = await getCurrentPage();
  if (page?.name) {
    let blockUUID = lastBlockUUID || (await getCurrentBlockUUID());
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);
      if (block?.uuid) {
        const prevBlock = await logseq.Editor.getPreviousSiblingBlock(
          block.uuid
        );
        if (prevBlock?.uuid) {
          scrollToBlockInPage(page.name, prevBlock.uuid);
          return prevBlock.uuid;
        } else if (block.parent.id) {
          const parentBlock = await logseq.Editor.getBlock(block.parent.id);
          if (parentBlock?.uuid) {
            scrollToBlockInPage(page.name, parentBlock.uuid);
            return parentBlock.uuid;
          }
        }
      }
    }
  } else {
    let blockUUID = lastBlockUUID || (await getCurrentBlockUUID());
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);
      const page = await logseq.Editor.getPage(block.page.id);
      if (block?.uuid) {
        const prevBlock = await logseq.Editor.getPreviousSiblingBlock(
          block.uuid
        );
        if (prevBlock?.uuid) {
          scrollToBlockInPage(page.name, prevBlock.uuid);
          return prevBlock.uuid;
        } else if (block.parent.id) {
          const parentBlock = await logseq.Editor.getBlock(block.parent.id);
          if (parentBlock?.uuid) {
            scrollToBlockInPage(page.name, parentBlock.uuid);
            return parentBlock.uuid;
          }
        }
      }
    }
  }
};

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.prevSibling)
    ? settings.keyBindings.prevSibling
    : [settings.keyBindings.prevSibling];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-prev-sibling-" + index,
        label: "Go to previous sibling",
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
          debug("Move block up");
          for (let i = 0; i < number; i++) {
            await logseq.App.invokeExternalCommand(
              // @ts-ignore
              "logseq.editor/move-block-up"
            );
          }
        } else {
          debug("Prev sibling");

          let lastBlockUUID: BlockUUID | undefined = undefined;
          for (let i = 0; i < number; i++) {
            lastBlockUUID = await goPrevSibling(lastBlockUUID);
          }
        }
      }
    );
  });
};
