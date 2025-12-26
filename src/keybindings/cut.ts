import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getNumber, getSettings, resetNumber, isKeyBindingEnabled } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('cut')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.cut)
    ? settings.keyBindings.cut
    : [settings.keyBindings.cut];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-cut-" + index,
        label: "Cut",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("cut");

        const selected = await logseq.Editor.getSelectedBlocks();
        if (selected.length > 1) {
          for (let block of selected) {
            const content = block.content.substring(1);

            await logseq.Editor.updateBlock(block.uuid, content);
          }
        } else {
          const block = await logseq.Editor.getCurrentBlock();
          if (block) {
            const content = block.content.substring(1);

            await logseq.Editor.updateBlock(block.uuid, content);
          }
        }
      }
    );
  });
};
