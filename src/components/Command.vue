<script lang="ts" setup>
import "@logseq/libs";
import minimist from "minimist";
import { ref } from "vue";

import * as commands from "@/commands";
import { useCommandStore } from "@/stores/command";
import { useColorStore } from "@/stores/color";
import { useSettingsStore } from "@/stores/settings";
import { useHelpStore } from "@/stores/help";

import emojiData from "../commands/emoji/emoji";
import { hideMainUI, pushCommandHistory } from "@/common/funcs";

const commandStore = useCommandStore();
const colorStore = useColorStore();
const settingsStore = useSettingsStore();
const helpStore = useHelpStore();

let wait = false;
const handleSelect = async (selected) => {
  const $input = document.querySelector(
    ".command-input input"
  ) as HTMLInputElement;
  wait = selected.wait || false;

  const value = $input.value;
  const splitInput = value.split(" ");
  splitInput[splitInput.length - 1] = selected.value;
  const newValue = splitInput.join(" ");

  setTimeout(() => {
    commandStore.setInput(newValue);
    $input.value = newValue;
    $input.focus();
  }, 200);
};

const handleEnter = async () => {
  const $input = document.querySelector(
    ".command-input input"
  ) as HTMLInputElement;
  const value = commandStore.input;
  if (wait) {
    wait = false;
    return;
  }
  if (!value) return;
  pushCommandHistory(value);
  commandStore.emptyInput();

  const split: string[] = value.split(" ");
  const args = split.slice(1).join(" ");
  const argv = minimist(args.split(" "));
  const cmd = split[0];

  let delayFocus = true;

  let pageName;
  switch (cmd) {
    case "h":
    case "help":
      commands.help.show();
      delayFocus = false;
      break;
    case "re":
    case "rename":
      pageName = split.slice(1).join(" ");
      await commands.page.rename(pageName);
      break;
    case "undo":
      await commands.invoke.undo();
      break;
    case "redo":
      await commands.invoke.redo();
      break;
    case "go!":
      pageName = argv._.join(" ");
      await commands.go.goOrCreate(pageName, argv);
      break;
    case "go":
      pageName = argv._.join(" ");
      await commands.go.go(pageName, argv);
      break;
    case "marks":
      commands.mark.marks();
      $input && $input.blur();
      break;
    case "delm":
    case "delmarks":
      if (argv._.length > 0) {
        await commands.mark.deleteMarks(argv._);
      }
      break;
    case "m":
    case "mark":
      commands.mark.mark(argv._[0]);
      break;
    case "delm!":
    case "delmarks!":
      await commands.mark.clearMarks();
      break;
    case "w":
    case "write":
      commands.page.write();
      break;
    case "wq":
      commands.page.writeAndQuit();
      break;
    case "lorem":
      await commands.lorem.generate(argv);
      hideMainUI();
      break;
    case "sort":
      hideMainUI();
      await commands.sort.sort();
      break;
    case "rsort":
      hideMainUI();
      await commands.sort.rsort();
      break;
    case "emoji-picker":
    case "emoji":
      await commands.emoji.generate(argv);
      break;

    case "bg-picker":
      await commands.bg.picker();
      commandStore.emptyInput();
      break;
    case "bg":
      await commands.bg.set(argv);
      commandStore.emptyInput();
      hideMainUI();
      break;
    case "bg-random":
      await commands.bg.random();
      commandStore.emptyInput();
      hideMainUI();
      break;
    case "bg-clear":
      await commands.bg.clear();
      commandStore.emptyInput();
      hideMainUI();
      break;
    case "copy-path":
      await commands.page.copyPath();
      break;
    case "open-in-vscode":
      await commands.page.openInVSCode();
      hideMainUI();
      break;
    case "clear-highlights":
      await commands.page.clearHighlights();
      hideMainUI();
      break;
    case "q":
    case "quit":
      commands.page.quit();
      break;
    case "settings":
      settingsStore.show();
      delayFocus = false;
      break;
    default:
      if (value.indexOf("s/") === 0 || value.indexOf("substitute/") === 0) {
        await commands.page.substituteBlock(value);
      } else if (
        value.indexOf("%s/") === 0 ||
        value.indexOf("%substitute/") === 0
      ) {
        await commands.page.substitutePage(value);
      } else if (!isNaN(Number(value)) || /\.\d+/.test(value)) {
        const blocks = await logseq.Editor.getCurrentPageBlocksTree();
        const page = await logseq.Editor.getCurrentPage();
        if (page && blocks.length > 0) {
          let line;
          if (/\.\d+/.test(value)) {
            line = Math.floor(+value * blocks.length);
          } else if (!isNaN(Number(value))) {
            if (+value < 0) {
              line = (+value % blocks.length) + blocks.length;
            } else if (+value > 0) {
              line = (+value % blocks.length) - 1;
            }
          }
          if (line !== undefined) {
            logseq.Editor.scrollToBlockInPage(page.name as string, blocks[line].uuid);
            hideMainUI();
          }
        }
      } else {
        logseq.UI.showMsg("Unknown command: " + cmd);
      }
      break;
  }

  commandStore.emptyInput();
  $input && $input.blur();
  if (delayFocus) {
    setTimeout(() => {
      $input && $input.focus();
    }, 100);
  }
};
const commandList = commandStore.getCommandList();
commandList.sort((a, b) => {
  if (a.value < b.value) {
    return -1;
  } else if (a.value > b.value) {
    return 1;
  } else {
    return 0;
  }
});
const isCommand = ref(true);
const querySearch = (queryString: string, cb: any) => {
  const $input = document.querySelector(
    ".command-input input"
  ) as HTMLInputElement;
  let results = queryString
    ? commandList.filter(
        (item) =>
          item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      )
    : commandList;

  if (results.length === 0) {
    isCommand.value = false;
    const splitQueryString: string[] = queryString.split(" ");

    switch (splitQueryString[0]) {
      case "bg":
        const subQueryString = splitQueryString.slice(1);
        const colorKeyword = subQueryString[subQueryString.length - 1];
        if (colorKeyword.length > 2) {
          results = Object.keys(colorStore.namedColors)
            .filter((color) => {
              return (
                color.toLowerCase().indexOf(colorKeyword.toLowerCase()) > -1
              );
            })
            .map((color) => {
              return {
                value: color,
                desc: `: <span style="background: ${color}" class="px-4 py-2 -mb-1 inline-block w-8"></span>`,
                wait: true,
              };
            });
        }
        break;
      case "emoji":
        if (
          !Number.isInteger(
            parseInt(splitQueryString[splitQueryString.length - 1])
          )
        ) {
          const subQueryString = splitQueryString
            .slice(1)
            .filter((item) => !Number.isInteger(item));

          const emojiKeyword = subQueryString[subQueryString.length - 1];
          if (emojiKeyword.length > 3) {
            results = emojiData
              .filter((emoji) => {
                const keyword = Array.isArray(emoji.keyword)
                  ? emoji.keyword
                  : [emoji.keyword];
                return (
                  `:${keyword.join(":|:")}:`
                    .toLowerCase()
                    .indexOf(emojiKeyword.toLowerCase()) > -1
                );
              })
              .map((emoji) => {
                return {
                  value: emoji.title,
                  desc: emoji.description,
                  wait: true,
                };
              });
          }

          if (
            emojiKeyword[0] === ":" &&
            emojiKeyword[emojiKeyword.length - 1] === ":" &&
            results.length > 0
          ) {
            subQueryString[subQueryString.length - 1] = results[0].value;
            $input.value = "emoji " + subQueryString.join(" ");
            commandStore.setInput($input.value);
          }
        }

        break;
    }
  } else {
    isCommand.value = true;
  }
  // call callback function to return suggestions
  cb(results);
};

const handleClose = () => {
  hideMainUI();
};

const handlePrependClick = () => {
  commandStore.enableTriggerOnFocus();
  const $input = document.querySelector('.command-input input') as HTMLInputElement;
  if ($input) {
    $input.focus();
    // Trigger suggestions to show all commands
    setTimeout(() => {
      $input.dispatchEvent(new Event('focus'));
    }, 100);
  }
};

const handleSettingsClick = () => {
  settingsStore.show();
};

const handleHelpClick = () => {
  helpStore.show();
};
</script>

<template>
  <div v-show="commandStore.visible">
  <el-autocomplete
    v-model="commandStore.input"
    :fetch-suggestions="querySearch"
    :trigger-on-focus="commandStore.triggerOnFocus"
    :highlight-first-item="true"
    :teleported="false"
    class="absolute bottom-0 z-40 w-full font-mono font-bold command-input"
    popper-class="w-[99%] overflow-hidden"
    size="large"
    placement="bottom-start"
    @select="handleSelect"
  >
    <template #prepend>
      <div @click="handlePrependClick" class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 -mx-2">:</div>
    </template>
    <template #append>
      <el-button class="command-run" @click="handleEnter" type="primary" title="Run (Enter)">
        <span class="command-icon">✓</span>
      </el-button>
      <el-button class="command-settings" @click="handleSettingsClick" type="default" title="Settings">
        <span class="command-icon">⚙</span>
      </el-button>
      <el-button class="command-help" @click="handleHelpClick" type="default" title="Help">
        <span class="command-icon">?</span>
      </el-button>
      <el-button class="command-close" @click="handleClose" type="primary" title="Close (Esc)">
        <span class="command-icon">✕</span>
      </el-button>
    </template>
    <template #default="{ item }">
      <div>
        <span v-if="isCommand">:</span
        ><span class="font-bold">{{ item.value }}</span>
        <span v-if="isCommand"> - </span>
        <span class="text-gray-400" v-html="item.desc"></span>
      </div>
    </template>
  </el-autocomplete>
  </div>
</template>

<style>
.el-autocomplete {
  position: absolute;
}

.command-icon {
  font-size: 18px;
  font-weight: bold;
  display: inline-block;
}
</style>
