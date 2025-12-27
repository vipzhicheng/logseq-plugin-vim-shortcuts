import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getCurrentBlockUUID,
  getSettings,
  writeClipboard,
  beforeActionExecute,
  beforeActionRegister,
} from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!beforeActionRegister("copyCurrentBlockRef")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.copyCurrentBlockRef)
    ? settings.keyBindings.copyCurrentBlockRef
    : [settings.keyBindings.copyCurrentBlockRef];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-copy-current-block-ref-" + index,
        label: "Copy current block ref",
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

        debug("Copy current block ref");
        let blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          let block = await logseq.Editor.getBlock(blockUUID);

          if (block?.uuid) {
            if (!block?.properties?.id) {
              await logseq.Editor.upsertBlockProperty(
                block.uuid,
                "id",
                block.uuid
              );
            }
            const ref = `((${block.uuid}))`;

            writeClipboard(ref);
          }
        }
      }
    );
  });
};
