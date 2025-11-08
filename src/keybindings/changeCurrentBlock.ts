import { BlockEntity, ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getCurrentBlockUUID,
  getSettings,
  writeClipboard,
} from "@/common/funcs";

const clearBlockAndEdit = async (currentBlock: BlockEntity): Promise<void> => {
  writeClipboard(currentBlock.content);
  await logseq.Editor.updateBlock(currentBlock.uuid, "");
  await logseq.Editor.editBlock(currentBlock.uuid);
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
        label: "Change current block",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("change current block");

        const selected = await logseq.Editor.getSelectedBlocks();
        debug(selected)
        if (selected && selected.length > 1) {
          for (let i = 1; i < selected.length; i++) {
            await logseq.Editor.removeBlock(selected[i].uuid);
          }
          await clearBlockAndEdit(selected[0]);
        } else {
          // normal mode: clear current block, edit current
          const blockUUID = await getCurrentBlockUUID();
          if (blockUUID) {
            const currentBlock = await logseq.Editor.getBlock(blockUUID);
            await clearBlockAndEdit(currentBlock);
          }
        }
      }
    );
  });
};
