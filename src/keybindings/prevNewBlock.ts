import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getCurrentBlockUUID, getSettings } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.prevNewBlock)
    ? settings.keyBindings.prevNewBlock
    : [settings.keyBindings.prevNewBlock];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-prev-new-block-" + index,
        label: "Create new prev block",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Create new prev block");
        let blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          let block = await logseq.Editor.getBlock(blockUUID);
          if (block?.uuid) {
            const newBlock = await logseq.Editor.insertBlock(block.uuid, "", {
              before: true,
              sibling: true,
            });

            if (newBlock?.uuid) {
              await logseq.Editor.editBlock(newBlock.uuid);
            }
          }
        }
      }
    );
  });
};
