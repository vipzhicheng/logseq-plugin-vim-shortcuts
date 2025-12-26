import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import * as cc from "change-case-all";
import { debug, getNumber, getSettings, resetNumber, isKeyBindingEnabled } from "@/common/funcs";
import { useSearchStore } from "@/stores/search";

export default (logseq: ILSPluginUser) => {
  // Check if this keybinding is disabled
  if (!isKeyBindingEnabled('changeCase')) {
    return;
  }

  const settings = getSettings();

  const bindings = Array.isArray(settings.keyBindings.changeCase)
    ? settings.keyBindings.changeCase
    : [settings.keyBindings.changeCase];

  bindings.forEach((binding, index) => {
    logseq.App.registerCommandPalette(
      {
        key: "vim-shortcut-change-case-" + index,
        label: "Change case",
        keybinding: {
          mode: "global",
          binding,
        },
      },
      async () => {
        debug("Change case");

        const number = getNumber();
        resetNumber();
        const searchStore = useSearchStore();
        // const actions = {
        //   1: 'upperCaseToggle',
        //   2: 'upperCase',
        //   3: 'lowerCase',
        //   4: 'titleCase',
        //   5: 'sentenceCase',
        //   6: 'pathCase',
        //   7: 'capitalCase',
        //   8: 'constantCase',
        //   9: 'dotCase',
        //   10: 'headerCase',
        //   11: 'paramCase',
        //   12: 'pascalCase',
        //   13: 'camelCase',
        //   14: 'snakeCase',
        //   15: 'swapCase',
        //   16: 'spongeCase'
        // };

        const block = await logseq.Editor.getCurrentBlock();
        if (!block || !block.content) return;

        const content = block.content;
        let textToChange = content;
        let beforeText = "";
        let afterText = "";
        let isVisualMode = false;

        // Check if in visual mode
        const visualSelection = searchStore.getVisualSelection();
        if (visualSelection && visualSelection.text) {
          const { start, end } = visualSelection;
          beforeText = content.substring(0, start);
          textToChange = content.substring(start, end + 1);
          afterText = content.substring(end + 1);
          isVisualMode = true;
        } else if (searchStore.cursorMode && searchStore.cursorBlockUUID === block.uuid) {
          // Change case of single character at cursor position
          const pos = searchStore.cursorPosition;
          if (pos >= 0 && pos < content.length) {
            beforeText = content.substring(0, pos);
            textToChange = content.charAt(pos);
            afterText = content.substring(pos + 1);
          }
        }

        let transformedText = textToChange;

        switch (number) {
          case 1:
            if (cc.isUpperCase(textToChange)) {
              transformedText = cc.lowerCase(textToChange);
            } else {
              transformedText = cc.upperCase(textToChange);
            }
            break;
          case 2:
            transformedText = cc.upperCase(textToChange);
            break;
          case 3:
            transformedText = cc.lowerCase(textToChange);
            break;
          case 4:
            transformedText = cc.titleCase(textToChange);
            break;
          case 5:
            transformedText = cc.sentenceCase(textToChange);
            break;
          case 6:
            transformedText = cc.pathCase(textToChange);
            break;
          case 7:
            transformedText = cc.capitalCase(textToChange);
            break;
          case 8:
            transformedText = cc.constantCase(textToChange);
            break;
          case 9:
            transformedText = cc.dotCase(textToChange);
            break;
          case 10:
            transformedText = cc.headerCase(textToChange);
            break;
          case 11:
            transformedText = cc.paramCase(textToChange);
            break;
          case 12:
            transformedText = cc.pascalCase(textToChange);
            break;
          case 13:
            transformedText = cc.camelCase(textToChange);
            break;
          case 14:
            transformedText = cc.snakeCase(textToChange);
            break;
          case 15:
            transformedText = cc.swapCase(textToChange);
            break;
          case 16:
            transformedText = cc.spongeCase(textToChange);
            break;
          default:
            break;
        }

        const newContent = beforeText + transformedText + afterText;

        if (newContent !== content) {
          await logseq.Editor.updateBlock(block.uuid, newContent);

          // Force UI refresh by briefly entering and exiting edit mode
          await logseq.Editor.editBlock(block.uuid);
          await logseq.Editor.exitEditingMode();

          // Exit visual mode after operation
          if (isVisualMode) {
            await searchStore.toggleVisualMode();
          }
        }
      }
    );
  });
};
