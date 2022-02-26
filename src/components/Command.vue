<script lang="ts" setup>
import "@logseq/libs";
import { useMarkStore } from "../stores/mark";
import { useHelpStore } from "../stores/help";
import { useCommandStore } from "../stores/command";
import minimist from "minimist";
import { format, add, sub } from "date-fns";
import { hideMainUI, pushCommandHistory } from "../common/funcs";

const markStore = useMarkStore();
const helpStore = useHelpStore();
const commandStore = useCommandStore();

const input = ref(null);
const triggerOnFocus = ref(false);

const parsePageName = async (pageName: string) => {
  const config = await logseq.App.getUserConfigs();
  const page = await logseq.Editor.getCurrentPage();
  switch (pageName) {
    case "@":
    case "@contents":
    case "@index":
      return "Contents";
    case "@today":
      pageName = format(new Date(), config.preferredDateFormat);
      return pageName;
    case "@yesterday":
      pageName = format(
        sub(new Date(), {
          days: 1,
        }),
        config.preferredDateFormat
      );
      return pageName;
    case "@tomorrow":
      pageName = format(
        add(new Date(), {
          days: 1,
        }),
        config.preferredDateFormat
      );
      return pageName;
    case "@prev":
      if (page["journal?"]) {
        pageName = format(
          sub(new Date(page.name), {
            days: 1,
          }),
          config.preferredDateFormat
        );
        return pageName;
      }
    case "@next":
      if (page["journal?"]) {
        pageName = format(
          add(new Date(page.name), {
            days: 1,
          }),
          config.preferredDateFormat
        );
        return pageName;
      }

    default:
      return pageName;
  }
};

const replaceBlock = async (block, regex, replace) => {
  const replaced = block.content.replace(regex, replace);
  await logseq.Editor.updateBlock(block.uuid, replaced);
};

const walkReplace = async (blocks: any[], regex, replace) => {
  if (blocks && blocks.length > 0) {
    for (let block of blocks) {
      const { children } = block;
      if (children && children.length > 0) {
        await walkReplace(children, regex, replace);
      }

      await replaceBlock(block, regex, replace);
    }
  }
};

let wait = false;
const handleSelect = async (selected) => {
  const $input = document.querySelector(
    ".command-input input"
  ) as HTMLInputElement;
  if ($input) {
    wait = selected.wait || false;
  }
};

const handleEnter = async () => {
  if (wait) {
    wait = false;
    return;
  }
  const $input = document.querySelector(
    ".command-input input"
  ) as HTMLInputElement;
  const value = $input.value;
  if (!value) return;
  pushCommandHistory(value);

  const split: string[] = value.split(" ");
  const args = split.slice(1).join(" ");
  const argv = minimist(args.split(" "));
  const cmd = split[0];

  let pageName, isBlock;
  switch (cmd) {
    case "h":
    case "help":
      helpStore.toggle();
      $input && $input.blur();
      break;
    case "option-trigger-autocomplete-on-focus":
      triggerOnFocus.value = true;
      logseq.App.showMsg("trigger-on-focus is on!");
      break;
    case "option-no-trigger-autocomplete-on-focus":
      triggerOnFocus.value = false;
      logseq.App.showMsg("trigger-on-focus is off!");
      break;
    case "go!":
      pageName = split.slice(1).join(" ");
      isBlock = /\(\((.*?)\)\)/.test(pageName);

      if (!isBlock) {
        pageName = await parsePageName(pageName);
        if (pageName) {
          let page = await logseq.Editor.getPage(pageName);

          if (!page) {
            page = await logseq.Editor.createPage(
              pageName,
              {},
              {
                createFirstBlock: true,
                redirect: true,
              }
            );
            const blocks = await logseq.Editor.getPageBlocksTree(pageName);
            await logseq.Editor.editBlock(blocks[0].uuid);
          } else {
            await logseq.App.pushState("page", {
              name: pageName,
            });
          }
        }
      } else {
        const match = pageName.match(/\(\((.*?)\)\)/);
        const blockId = match[1];
        const block = await logseq.Editor.getBlock(blockId);
        if (block) {
          const page = await logseq.Editor.getPage(block.page.id);
          await logseq.Editor.scrollToBlockInPage(page.name, blockId);
        } else {
          logseq.App.showMsg("Block not exist!");
        }
      }
      hideMainUI();
      break;
    case "go":
      pageName = split.slice(1).join(" ");
      isBlock = /\(\((.*?)\)\)/.test(pageName);

      if (!isBlock) {
        pageName = await parsePageName(pageName);

        if (pageName) {
          let page = await logseq.Editor.getPage(pageName);

          if (!page) {
            logseq.App.showMsg("Page not exist!");
          } else {
            await logseq.App.pushState("page", {
              name: pageName,
            });
          }
        }
      } else {
        const match = pageName.match(/\(\((.*?)\)\)/);
        const blockId = match[1];
        const block = await logseq.Editor.getBlock(blockId);
        if (block) {
          const page = await logseq.Editor.getPage(block.page.id);
          await logseq.Editor.scrollToBlockInPage(page.name, blockId);
        } else {
          logseq.App.showMsg("Block not exist!");
        }
      }
      hideMainUI();
      break;
    case "marks":
      markStore.reload();
      markStore.toggle();
      $input && $input.blur();
      break;
    case "delm":
    case "delmarks":
      if (argv._.length > 0) {
        await markStore.deleteMarks(argv._);
        markStore.reload();
      }
      break;
    case "m":
    case "mark":
      const m = markStore.getMark(argv._[0]);
      if (m) {
        if (m.block) {
          logseq.Editor.scrollToBlockInPage(m.page, m.block);
        } else {
          logseq.App.pushState("page", {
            name: m.page,
          });
        }
      }
      break;
    case "delm!":
    case "delmarks!":
      await markStore.clearMarks();
      markStore.reload();
      break;
    case "w":
    case "write":
      logseq.App.showMsg("Actually Logseq save your info automatically!");
      break;
    case "wq":
      logseq.App.showMsg(
        "Actually Logseq save your info automatically! So just quit VIM command mode."
      );
      hideMainUI();
      break;
    case "q":
      logseq.App.showMsg("Quit VIM command mode.");
      hideMainUI();
      break;
    default:
      if (value.indexOf("s/") === 0 || value.indexOf("substitute/") === 0) {
        const splitReplace = value.split("/");
        const search = splitReplace[1];
        if (search) {
          const replace = splitReplace[2] || "";
          const modifiers = splitReplace[3] || "";
          const regex = new RegExp(search, modifiers);
          const block = await logseq.Editor.getCurrentBlock();
          if (block.uuid && block.content) {
            await replaceBlock(block, regex, replace);
            await logseq.App.showMsg(
              'Current block replaced "' + search + '" with "' + replace + '"'
            );
            hideMainUI();
          } else {
            await logseq.App.showMsg(
              "Current block not found. Please select a block first."
            );
          }
        } else {
          await logseq.App.showMsg('Please input "s/search/replace/modifiers"');
        }
      } else if (
        value.indexOf("%s/") === 0 ||
        value.indexOf("%substitute/") === 0
      ) {
        const blocks = await logseq.Editor.getCurrentPageBlocksTree();
        const splitReplace = value.split("/");
        const search = splitReplace[1];
        if (search) {
          const replace = splitReplace[2] || "";
          const modifiers = splitReplace[3] || "";
          const regex = new RegExp(search, modifiers);
          await walkReplace(blocks, regex, replace);
          await logseq.App.showMsg(
            'Current page blocks replaced "' +
              search +
              '" with "' +
              replace +
              '"'
          );
          hideMainUI();
        } else {
          await logseq.App.showMsg(
            'Please input "%s/search/replace/modifiers"'
          );
        }
      } else {
        logseq.App.showMsg("Unknown command");
      }
      break;
  }

  input.value = "";
  $input && $input.blur();
  setTimeout(() => {
    $input && $input.focus();
  }, 100);
};
const commands = commandStore.getCommands();
const querySearch = (queryString: string, cb: any) => {
  const results = queryString
    ? commands.filter(
        (item) =>
          item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      )
    : commands;
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
    v-model="input"
    :fetch-suggestions="querySearch"
    :trigger-on-focus="triggerOnFocus"
    :highlight-first-item="true"
    :teleported="false"
    class="w-full command-input absolute bottom-0"
    popper-class="w-[99%] overflow-hidden"
    size="large"
    placement="bottom-start"
    @select="handleSelect"
    @change="handleEnter"
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
        <span class="text-gray-400">-- {{ item.desc }}</span>
      </div>
    </template>
  </el-autocomplete>
</template>

<style>
.el-autocomplete {
  position: absolute;
}
</style>
