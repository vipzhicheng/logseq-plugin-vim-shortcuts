import {
  BlockEntity,
  BlockUUID,
  ILSPluginUser,
} from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getCurrentBlockUUID,
  getSettings,
  beforeActionExecute,
  beforeActionRegister,
} from "@/common/funcs";

const collapse = async (blockUUID: BlockUUID | undefined) => {
  if (blockUUID) {
    try {
      await logseq.Editor.setBlockCollapsed(blockUUID, { flag: true });
    } catch (e) {}

    const block = await logseq.Editor.getBlock(blockUUID, {
      includeChildren: true,
    });
    if (block && block.children && block.children.length > 0) {
      for (let item of block.children as BlockEntity[]) {
        if (item.uuid) {
          await collapse(item.uuid);
        }
      }
    }
  }
};

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!beforeActionRegister("collapseAll")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.collapseAll)
    ? settings.keyBindings.collapseAll
    : [settings.keyBindings.collapseAll];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-collapse-hierarchically-" + index,
        label: "Collapse block hierarchically",
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

        debug("Collapse block hierarchically");

        let blockUUID = await getCurrentBlockUUID();
        await collapse(blockUUID);
      }
    );
  });
};
