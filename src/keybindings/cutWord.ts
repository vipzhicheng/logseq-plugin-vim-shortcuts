import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getNumber, getSettings, resetNumber } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.cutWord)
    ? settings.keyBindings.cutWord
    : [settings.keyBindings.cutWord];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-cut-word-" + index,
        label: "Cut word",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("cut word");

        const selected = await logseq.Editor.getSelectedBlocks();
        if (selected.length > 1) {
          for (let block of selected) {
            const content = block.content.split(" ").slice(1).join(" ");

            await logseq.Editor.updateBlock(block.uuid, content);
          }
        } else {
          const block = await logseq.Editor.getCurrentBlock();
          if (block) {
            const content = block.content.split(" ").slice(1).join(" ");

            await logseq.Editor.updateBlock(block.uuid, content);
          }
        }
      }
    );
  });
};
