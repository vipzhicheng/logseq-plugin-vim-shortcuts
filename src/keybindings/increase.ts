import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getNumber,
  getSettings,
  resetNumber,
  beforeActionExecute,
  beforeActionRegister,
} from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!beforeActionRegister("increase")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.increase)
    ? settings.keyBindings.increase
    : [settings.keyBindings.increase];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-increase-" + index,
        label: "Increase",
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

        debug("increase");

        const number = getNumber();
        resetNumber();

        const selected = await logseq.Editor.getSelectedBlocks();
        if (selected.length > 1) {
          for (let block of selected) {
            const content = block.content.replace(
              /^(\s*)(-?[0-9]+)/,
              (_match, spaces, num) => {
                return `${spaces}${parseInt(num) + number}`;
              }
            );

            await logseq.Editor.updateBlock(block.uuid, content);
          }
        } else {
          const block = await logseq.Editor.getCurrentBlock();
          if (block) {
            const content = block.content.replace(
              /^(\s*)(-?[0-9]+)/,
              (_match, spaces, num) => {
                return `${spaces}${parseInt(num) + number}`;
              }
            );

            await logseq.Editor.updateBlock(block.uuid, content);
          }
        }
      }
    );
  });
};
