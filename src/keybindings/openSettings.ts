import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import {
  debug,
  getSettings,
  beforeActionExecute,
  beforeActionRegister,
} from "@/common/funcs";
import { useSettingsStore } from "@/stores/settings";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!beforeActionRegister("openSettings")) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.openSettings)
    ? settings.keyBindings.openSettings
    : [settings.keyBindings.openSettings];

  bindings.forEach((binding, index) => {
    // Determine if binding is empty
    const hasBinding = binding && binding.trim() !== "";

    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-open-settings-" + index,
        label: "Open Vim Shortcuts settings",
        ...(hasBinding && {
          keybinding: {
            mode: "global",
            binding,
          },
        }),
      },
      async () => {
        // Check before action hook
        if (!beforeActionExecute()) {
          return;
        }

        debug("Open settings");
        const settingsStore = useSettingsStore();
        settingsStore.show();
        logseq.showMainUI({
          autoFocus: false,
        });
      }
    );
  });
};
