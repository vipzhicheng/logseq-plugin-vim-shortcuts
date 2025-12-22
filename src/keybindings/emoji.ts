import { debug, getSettings, showMainUI } from "@/common/funcs";
import { useEmojiStore } from "@/stores/emoji";
import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.emoji)
    ? settings.keyBindings.emoji
    : [settings.keyBindings.emoji];

  const emojiHandler = async () => {
    debug("Insert emoji");

    showMainUI(false);

    const isEditing = await logseq.Editor.checkEditing();
    if (!isEditing) {
      logseq.UI.showMsg("Please edit a block first.");
      return;
    }
    const emojiStore = useEmojiStore();
    emojiStore.showPicker();
  };

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-emoji-" + index,
        label: "Insert emoji",
        keybinding: {
          mode: "global",
          binding,
        },
      },
      emojiHandler
    );
  });

  logseq.Editor.registerSlashCommand("Insert Emoji", emojiHandler);
};
