<script lang="ts" setup>
import "@logseq/libs";
import minimist from "minimist";

import * as commands from "@/commands";
import { useCommandStore } from "@/stores/command";
import { hideMainUI, pushCommandHistory, sleep } from "@/common/funcs";

import emojiData from "../commands/emoji/emoji";

const commandStore = useCommandStore();

let wait = false;
const handleSelect = async (selected) => {
  const $input = document.querySelector(
    ".command-input input"
  ) as HTMLInputElement;
  wait = selected.wait || false;

  const splitInput = $input.value.split(" ");
  splitInput[splitInput.length - 1] = selected.value;

  setTimeout(() => {
    $input.value = splitInput.join(" ");
    $input.focus();
  }, 300);
};

const handleEnter = async () => {
  const $input = document.querySelector(
    ".command-input input"
  ) as HTMLInputElement;
  const value = $input.value;
  if (wait) {
    wait = false;
    return;
  }
  if (!value) return;
  pushCommandHistory(value);

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
    case "option-trigger-autocomplete-on-focus":
      commandStore.enableTriggerOnFocus();
      logseq.App.showMsg("trigger-on-focus is on!");
      break;
    case "option-no-trigger-autocomplete-on-focus":
      commandStore.disableTriggerOnFocus();
      logseq.App.showMsg("trigger-on-focus is off!");
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
      pageName = split.slice(1).join(" ");
      await commands.go.goOrCreate(pageName);
      break;
    case "go":
      pageName = split.slice(1).join(" ");
      await commands.go.go(pageName);
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
    case "lorem-ipsum":
      await commands.lorem.generate(argv);
      hideMainUI();
      break;
    // case "sort":
    //   await commands.sort.sort();
    //   hideMainUI();
    //   break;
    case "emo":
    case "emoji":
      await commands.emoji.generate(argv);
      hideMainUI();
      break;
    case "q":
    case "quit":
      commands.page.quit();
      break;
    default:
      if (value.indexOf("s/") === 0 || value.indexOf("substitute/") === 0) {
        await commands.page.substituteBlock(value);
      } else if (
        value.indexOf("%s/") === 0 ||
        value.indexOf("%substitute/") === 0
      ) {
        await commands.page.substitutePage(value);
      } else {
        logseq.App.showMsg("Unknown command");
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
const querySearch = (queryString: string, cb: any) => {
  let results = queryString
    ? commandList.filter(
        (item) =>
          item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      )
    : commandList;

  if (results.length === 0) {
    const splitQueryString: string[] = queryString.split(" ");

    switch (splitQueryString[0]) {
      case "emo":
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
          if (emojiKeyword.length > 2) {
            results = emojiData.emoji
              .filter((emoji) => {
                return (
                  emoji.name.toLowerCase().indexOf(emojiKeyword.toLowerCase()) >
                  -1
                );
              })
              .map((item) => ({
                value: item.emoji,
                desc: item.name,
                wait: true,
              }));
          }
        }

        break;
    }
  }
  // call callback function to return suggestions
  cb(results);
};

const handleClose = () => {
  logseq.App.showMsg("Quit VIM command mode.");
  hideMainUI();
};
</script>

<template>
  <el-autocomplete
    v-model="commandStore.input"
    :fetch-suggestions="querySearch"
    :trigger-on-focus="commandStore.triggerOnFocus"
    :highlight-first-item="true"
    :teleported="false"
    class="w-full command-input absolute bottom-0"
    popper-class="w-[99%] overflow-hidden"
    size="large"
    placement="bottom-start"
    @select="handleSelect"
  >
    <template #prepend>:</template>
    <template #append>
      <el-button class="command-run" @click="handleEnter" type="primary">
        Run
      </el-button>
      <el-button class="command-close" @click="handleClose" type="primary">
        Close
      </el-button>
    </template>
    <template #default="{ item }">
      <div>
        :{{ item.value }}
        <span class="text-gray-400"> - {{ item.desc }}</span>
      </div>
    </template>
  </el-autocomplete>
</template>

<style>
.el-autocomplete {
  position: absolute;
}
</style>
