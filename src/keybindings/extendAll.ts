import {
  BlockEntity,
  BlockUUID,
  ILSPluginUser,
} from "@logseq/libs/dist/LSPlugin";
import { debug, getCurrentBlockUUID, getSettings, isKeyBindingEnabled } from "@/common/funcs";

const extend = async (blockUUID: BlockUUID | undefined) => {
  if (blockUUID) {
    try {
      await logseq.Editor.setBlockCollapsed(blockUUID, { flag: false });
    } catch (e) {}

    const block = await logseq.Editor.getBlock(blockUUID, {
      includeChildren: true,
    });

    if (block && block.children && block.children.length > 0) {
      for (let item of block.children as BlockEntity[]) {
        if (item.uuid) {
          await extend(item.uuid);
        }
      }
    }
  }
};

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('extendAll')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.extendAll)
    ? settings.keyBindings.extendAll
    : [settings.keyBindings.extendAll];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-extend-hierarchically-" + index,
        label: "Extend block hierarchically",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Extend block hierarchically");

        let blockUUID = await getCurrentBlockUUID();
        await extend(blockUUID);
      }
    );
  });
};
