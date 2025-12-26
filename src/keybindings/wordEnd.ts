import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getSettings, isKeyBindingEnabled } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('wordEnd')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.wordEnd)
    ? settings.keyBindings.wordEnd
    : [settings.keyBindings.wordEnd];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-word-end-" + index,
        label: "Move to word end (e)",
        keybinding: {
          mode: "non-editing",
          binding,
        },
      },
      async () => {
        debug("Word end");
        const searchStore = useSearchStore();
        await searchStore.moveWordEnd();
      }
    );
  });
};
