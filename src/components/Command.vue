<script lang="ts" setup>
import "@logseq/libs";
import { useMarkStore } from "../stores/mark";
import { useHelpStore } from "../stores/help";
import minimist from "minimist";

const mark = useMarkStore();
const help = useHelpStore();

const input = ref(null);
const triggerOnFocus = ref(false);

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
  const el = document.querySelector(".command-input input") as HTMLInputElement;
  if (el) {
    wait = selected.wait || false;
  }
};

const handleEnter = async (value) => {
  if (!value) return;
  if (wait) {
    wait = false;
    return;
  }
  const el = document.querySelector(".command-input input") as HTMLInputElement;
  const split: string[] = value.split(" ");
  const args = split.slice(1).join(" ");
  const argv = minimist(args.split(" "));
  const cmd = split[0];

  let pageName, isBlock;
  switch (cmd) {
    case "h":
    case "help":
      help.toggle();
      el && el.blur();
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
      await logseq.hideMainUI({
        restoreEditingCursor: true,
      });
      break;
    case "go":
      pageName = split.slice(1).join(" ");
      isBlock = /\(\((.*?)\)\)/.test(pageName);

      if (!isBlock) {
        let page = await logseq.Editor.getPage(pageName);

        if (!page) {
          logseq.App.showMsg("Page not exist!");
        } else {
          await logseq.App.pushState("page", {
            name: pageName,
          });
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
      await logseq.hideMainUI({
        restoreEditingCursor: true,
      });
      break;
    case "marks":
      mark.reload();
      mark.toggle();
      el && el.blur();
      break;
    case "delm":
    case "delmarks":
      if (argv._.length > 0) {
        await mark.deleteMarks(argv._);
        mark.reload();
      }
      break;
    case "m":
    case "mark":
      const m = mark.getMark(argv._[0]);
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
      await mark.clearMarks();
      mark.reload();
      break;
    case "w":
    case "write":
      logseq.App.showMsg("Actually Logseq save your info automatically!");
      break;
    case "wq":
      logseq.App.showMsg(
        "Actually Logseq save your info automatically! So just quit VIM command mode."
      );
      logseq.hideMainUI({
        restoreEditingCursor: true,
      });
      break;
    case "q":
      logseq.App.showMsg("Quit VIM command mode.");
      logseq.hideMainUI({
        restoreEditingCursor: true,
      });
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
            logseq.hideMainUI({
              restoreEditingCursor: true,
            });
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
          logseq.hideMainUI({
            restoreEditingCursor: true,
          });
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
  el && el.blur();
  setTimeout(() => {
    el && el.focus();
  }, 100);
};
const commands = [
  { value: "s/", desc: "Replace current block according regex.", wait: true },
  {
    value: "substitute/",
    desc: "Replace current block according regex.",
    wait: true,
  },
  {
    value: "%s/",
    desc: "Replace current page blocks according regex.",
    wait: true,
  },
  {
    value: "%substitute/",
    desc: "Replace current page blocks according regex.",
    wait: true,
  },
  { value: "m", desc: "Go to marked page or block.", wait: true },
  { value: "mark", desc: "Go to marked page or block.", wait: true },
  { value: "marks", desc: "Show marks." },
  { value: "delm", desc: "Delete specific marks.", wait: true },
  { value: "delmarks", desc: "Delete specific marks.", wait: true },
  { value: "delm!", desc: "Delete all marks.", wait: false },
  { value: "delmarks!", desc: "Delete all marks.", wait: false },
  { value: "w", desc: "Save current page." },
  { value: "write", desc: "Save current page." },
  { value: "wq", desc: "Save current page and quit vim command mode." },
  { value: "q", desc: "Quit vim command mode." },
  { value: "go ", desc: "Create new page or go to existed page.", wait: true },
  {
    value: "option-trigger-autocomplete-on-focus",
    desc: "Trigger autocomplete on focus.",
    wait: false,
  },
  {
    value: "option-no-trigger-autocomplete-on-focus",
    desc: "No trigger autocomplete on focus.",
    wait: false,
  },
  {
    value: "h",
    desc: "Show help modal.",
    wait: false,
  },
  {
    value: "help",
    desc: "Show help modal.",
    wait: false,
  },
];
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
  logseq.hideMainUI({
    restoreEditingCursor: true,
  });
};
</script>

<template>
  <div class="absolute bottom-0 w-full">
    <el-autocomplete
      v-model="input"
      :fetch-suggestions="querySearch"
      :trigger-on-focus="triggerOnFocus"
      :highlight-first-item="true"
      :teleported="false"
      class="w-full command-input"
      popper-class="w-[99%] overflow-hidden"
      size="large"
      placement="bottom-start"
      @select="handleSelect"
      @change="handleEnter"
    >
      <template #prepend>:</template>
      <template #append>
        <el-button
          class="command-input-button"
          @click="handleClose"
          type="primary"
        >
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
  </div>
</template>

<style></style>
