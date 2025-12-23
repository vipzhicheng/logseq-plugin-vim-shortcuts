import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getCurrentBlockUUID, getSettings } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.insertBefore)
    ? settings.keyBindings.insertBefore
    : [settings.keyBindings.insertBefore];

  bindings.forEach((binding, index) => {
    // Determine if this binding has shift modifier (uppercase)
    const isUpperCase = binding.toLowerCase().includes("shift+");
    const key = binding; // Use the actual binding as the key

    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-insert-before-" + index,
        label: isUpperCase
          ? `Enter insert mode at line start (${binding})`
          : `Enter insert mode before cursor (${binding}) or match start if searching`,
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug(`Insert before (${key})`);

        let blockUUID = await getCurrentBlockUUID();
        if (blockUUID) {
          if (isUpperCase) {
            // Uppercase (with shift) - Always insert at line start
            await logseq.Editor.editBlock(blockUUID, {
              pos: 0,
            });
          } else {
            // Lowercase (no shift) - Check if we're in a search and have a current match
            const searchStore = useSearchStore();
            const currentMatch = searchStore.getCurrentMatch();

            if (currentMatch && currentMatch.uuid === blockUUID && searchStore.input) {
              // Insert at the start of the match
              await logseq.Editor.editBlock(blockUUID, {
                pos: currentMatch.matchOffset,
              });
            } else {
              // Default behavior: enter edit mode
              await logseq.Editor.editBlock(blockUUID);
            }
          }
        }
      }
    );
  });
};
