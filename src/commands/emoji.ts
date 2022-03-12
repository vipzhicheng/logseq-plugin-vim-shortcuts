import "@logseq/libs";
import { useEmojiStore } from "@/stores/emoji";
import { hideMainUI } from "@/common/funcs";
import { useCommandStore } from "@/stores/command";

export async function generate(argv) {
  if (argv._.length < 1 || !argv._[0]) {
    // logseq.App.showMsg("Please input at least one emoji.");
    // popup emoji picker
    const isEditing = await logseq.Editor.checkEditing();
    if (!isEditing) {
      logseq.App.showMsg("Please edit a block first.");
      return;
    }
    const emojiStore = useEmojiStore();
    emojiStore.showPicker();
    const commandStore = useCommandStore();
    commandStore.hide();

    return;
  }
  let repeats = 1;
  if (Number.isInteger(parseInt(argv._[argv._.length - 1]))) {
    repeats = parseInt(argv._[argv._.length - 1]);
    argv._.pop();
  }

  if (argv._.length < 1) {
    logseq.App.showMsg("Please input at least one emoji.");
    return;
  }

  for (let i = 0; i < argv._.length; i++) {
    const char = argv._[i];
    const charRepeats = [...new Array(repeats)].map(() => char).join("");
    await logseq.Editor.insertAtEditingCursor(charRepeats);

    if (argv.space) {
      await logseq.Editor.insertAtEditingCursor(" ");
    }
  }
  hideMainUI();
}
