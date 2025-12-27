import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getSettings,
  beforeActionExecute,
  beforeActionRegister,
} from "@/common/funcs";
import { useCommandStore } from "@/stores/command";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!beforeActionRegister("command")) {
    return;
  }

  const commandStore = useCommandStore();
  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.command)
    ? settings.keyBindings.command
    : [settings.keyBindings.command];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-command-" + index,
        label: "Call VIM commands",
        keybinding: {
          mode: "global",
          binding,
        },
      },
      async () => {
        // Check before action hook
        if (!beforeActionExecute()) {
          return;
        }

        debug("Call VIM commands");
        await logseq.Editor.exitEditingMode(true);
        commandStore.show();
        logseq.showMainUI({
          autoFocus: true,
        });

        const $input = document.querySelector(
          ".command-input input"
        ) as HTMLInputElement;
        setTimeout(() => {
          $input && $input.focus();
        }, 500);
      }
    );
  });

  logseq.App.registerCommandPalette(
    {
      key: "vim-shortcut-command-non-editing",
      label: "Call VIM commands",
      keybinding: {
        mode: "non-editing",
        binding: "shift+;",
      },
    },
    async () => {
      // Check before action hook
      if (!beforeActionExecute()) {
        return;
      }

      debug("Call VIM commands non editing");
      await logseq.Editor.exitEditingMode(true);
      commandStore.show();
      logseq.showMainUI({
        autoFocus: true,
      });

      const $input = document.querySelector(
        ".command-input input"
      ) as HTMLInputElement;

      setTimeout(() => {
        $input && $input.focus();
      }, 500);
    }
  );
};
