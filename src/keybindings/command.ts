import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import { debug, getSettings } from "../common/funcs";

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  const handleDocumentClick = () => {
    const $input = document.querySelector(
      ".command-input input"
    ) as HTMLInputElement;
    $input && $input.blur();
  };

  const bindings = Array.isArray(settings.command)
    ? settings.command
    : [settings.command];

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
        logseq.showMainUI({
          autoFocus: true,
        });

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
      logseq.showMainUI({
        autoFocus: true,
      });

      document.removeEventListener("click", handleDocumentClick);
      document.addEventListener("click", handleDocumentClick);
    }
  );
};
