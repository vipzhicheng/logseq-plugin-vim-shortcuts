import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getSettings } from "@/common/funcs";
import { useCommandStore } from "@/stores/command";

export default (logseq: ILSPluginUser) => {
  const commandStore = useCommandStore();
  const settings = getSettings();

  const handleDocumentClick = () => {
    const $input = document.querySelector(
      ".command-input input"
    ) as HTMLInputElement;
    $input && $input.blur();
  };

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
        debug("Call VIM commands");
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

        document.removeEventListener("click", handleDocumentClick);
        document.addEventListener("click", handleDocumentClick);
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
      debug("Call VIM commands non editing");
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

      document.removeEventListener("click", handleDocumentClick);
      document.addEventListener("click", handleDocumentClick);
    }
  );
};
