import { BlockUUID, ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug,
  getCurrentBlockUUID,
  getCurrentPage,
  getNumber,
  getSettings,
  resetNumber,
  scrollToBlockInPage, isKeyBindingEnabled } from "@/common/funcs";

const goPrevSibling = async (lastBlockUUID: BlockUUID | undefined) => {
  const page = await getCurrentPage();
  if (page?.name) {
    let blockUUID = lastBlockUUID || (await getCurrentBlockUUID());
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);
      if (block?.uuid) {
        const prevBlock = await logseq.Editor.getPreviousSiblingBlock(
          block.uuid as string
        );
        if (prevBlock?.uuid) {
          scrollToBlockInPage((page.name || page.uuid) as string, prevBlock.uuid as string);
          return prevBlock.uuid;
        } else if (block.parent.id) {
          const parentBlock = await logseq.Editor.getBlock(block.parent.id);
          if (parentBlock?.uuid) {
            scrollToBlockInPage((page.name || page.uuid) as string, parentBlock.uuid as string);
            return parentBlock.uuid;
          }
        }
      }
    }
  } else {
    let blockUUID = lastBlockUUID || (await getCurrentBlockUUID());
    if (blockUUID) {
      let block = await logseq.Editor.getBlock(blockUUID);
      if (block?.uuid) {
        const prevBlock = await logseq.Editor.getPreviousSiblingBlock(
          block.uuid
        );
        if (prevBlock?.uuid) {
          scrollToBlockInPage(page.uuid, prevBlock.uuid);
          return prevBlock.uuid;
        } else if (block.parent.id) {
          const parentBlock = await logseq.Editor.getBlock(block.parent.id);
          if (parentBlock?.uuid) {
            scrollToBlockInPage(page.uuid, parentBlock.uuid);
            return parentBlock.uuid;
          }
        }
      }
    }
  }
};

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('prevSibling')) {
    return;
  }

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

        debug("Prev sibling");

        let lastBlockUUID: BlockUUID | undefined = undefined;
        for (let i = 0; i < number; i++) {
          lastBlockUUID = await goPrevSibling(lastBlockUUID);
        }
      }
    );
  });
};
