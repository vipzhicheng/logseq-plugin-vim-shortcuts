import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getCurrentBlockUUID, getSettings } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.insert)
    ? settings.keyBindings.insert
    : [settings.keyBindings.insert];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-insert-" + index,
        label: "Enter insert mode",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Insert");

        let blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          await logseq.Editor.editBlock(blockUUID);
        }
      }
    );
  });
};
