import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getNumber, getSettings, resetNumber, isKeyBindingEnabled } from "@/common/funcs";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('joinNextLine')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.joinNextLine)
    ? settings.keyBindings.joinNextLine
    : [settings.keyBindings.joinNextLine];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-join-next-line-" + index,
        label: "Join next line",
        keybinding: {
          mode: "global",
          binding,
        },
      },
      async () => {
        debug("Join next line");

        const number = getNumber();
        resetNumber();

        for (let i = 0; i < number; i++) {
          const block = await logseq.Editor.getCurrentBlock();
          if (block?.uuid) {
            const nextBlock = await logseq.Editor.getNextSiblingBlock(
              block?.uuid
            );
            if (nextBlock?.uuid) {
              if (
                (!block.children || block.children.length === 0) &&
                (!nextBlock.children || nextBlock.children.length === 0)
              ) {
                if (block.content.search(/\n\s*[^ ]+:: /) === -1) {
                  await logseq.Editor.updateBlock(
                    block.uuid,
                    block.content + " " + nextBlock.content
                  );
                } else {
                  const pos = block.content.search(/\n\s*[^ ]+:: /);
                  const newContent =
                    block.content.substring(0, pos) +
                    " " +
                    nextBlock.content +
                    block.content.substring(pos);
                  await logseq.Editor.updateBlock(block.uuid, newContent);
                }

                await logseq.Editor.removeBlock(nextBlock.uuid);
              }
            }
          }
        }
      }
    );
  });
};
