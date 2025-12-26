import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
import * as cc from "change-case-all";
import { debug, getNumber, getSettings, resetNumber, isKeyBindingEnabled } from "@/common/funcs";

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
        if (block && block.content) {
          const content = block.content;

          switch (number) {
            case 1:
              if (cc.isUpperCase(content)) {
                await logseq.Editor.updateBlock(
                  block.uuid,
                  cc.lowerCase(content)
                );
              } else {
                await logseq.Editor.updateBlock(
                  block.uuid,
                  cc.upperCase(content)
                );
              }
              break;
            case 2:
              await logseq.Editor.updateBlock(
                block.uuid,
                cc.upperCase(content)
              );
              break;
            case 3:
              await logseq.Editor.updateBlock(
                block.uuid,
                cc.lowerCase(content)
              );
              break;
            case 4:
              await logseq.Editor.updateBlock(
                block.uuid,
                cc.titleCase(content)
              );
              break;
            case 5:
              await logseq.Editor.updateBlock(
                block.uuid,
                cc.sentenceCase(content)
              );
              break;
            case 6:
              await logseq.Editor.updateBlock(block.uuid, cc.pathCase(content));
              break;
            case 7:
              await logseq.Editor.updateBlock(
                block.uuid,
                cc.capitalCase(content)
              );
              break;
            case 8:
              await logseq.Editor.updateBlock(
                block.uuid,
                cc.constantCase(content)
              );
              break;
            case 9:
              await logseq.Editor.updateBlock(block.uuid, cc.dotCase(content));
              break;
            case 10:
              await logseq.Editor.updateBlock(
                block.uuid,
                cc.headerCase(content)
              );
              break;
            case 11:
              await logseq.Editor.updateBlock(
                block.uuid,
                cc.paramCase(content)
              );
              break;
            case 12:
              await logseq.Editor.updateBlock(
                block.uuid,
                cc.pascalCase(content)
              );
              break;
            case 13:
              await logseq.Editor.updateBlock(
                block.uuid,
                cc.camelCase(content)
              );
              break;
            case 14:
              await logseq.Editor.updateBlock(
                block.uuid,
                cc.snakeCase(content)
              );
              break;
            case 15:
              await logseq.Editor.updateBlock(block.uuid, cc.swapCase(content));
              break;
            case 16:
              await logseq.Editor.updateBlock(
                block.uuid,
                cc.spongeCase(content)
              );
              break;
            default:
              break;
          }
        }
      }
    );
  });
};
