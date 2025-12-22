import { clearCurrentPageBlocksHighlight, hideMainUI } from "@/common/funcs";
import "@logseq/libs";
import { useCopyTextStore } from "@/stores/copy-text";
import { format } from "date-fns";

const replaceBlock = async (block, regex, replace) => {
  const replaced = block.content.replace(regex, replace);
  await logseq.Editor.updateBlock(block.uuid, replaced);
};

function parseEscapeSequences(str) {
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "\r")
    .replace(/\\s/g, " ");
  // 可以根据需要支持其他转义字符，比如 \\r, \\s 等
}

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

export async function openInVSCode() {
  let page = await logseq.Editor.getCurrentPage();
  if (!page) {
    let block = await logseq.Editor.getCurrentBlock();
    if (block?.page.id) {
      page = await logseq.Editor.getPage(block.page.id);
    }
  }
  const graph = await logseq.App.getCurrentGraph();
  let pagePath;
  if (page && graph) {
    const { path } = graph;
    if (page["journal?"]) {
      const fileName = [
        `${page.journalDay}`.substring(0, 4),
        `${page.journalDay}`.substring(4, 6),
        `${page.journalDay}`.substring(6),
      ].join("_");
      pagePath = `${path}/journals/${fileName}.md`;
    } else {
      const fileName = page.originalName
        .replace(/^\//, "")
        .replace(/\/$/, "")
        .replace(/\//g, ".")
        .replace(/[:*?"<>|]+/g, "_")
        .replace(/[\\#|%]+/g, "_");
      pagePath = `${path}/pages/${fileName}.md`;
    }

    window.open(`vscode://file/${pagePath}`, "_blank");
  }
}

export async function copyPath() {
  const copyTextStore = useCopyTextStore();
  let page = await logseq.Editor.getCurrentPage();
  if (!page) {
    let block = await logseq.Editor.getCurrentBlock();
    if (block?.page.id) {
      page = await logseq.Editor.getPage(block.page.id);
    }
  }
  const graph = await logseq.App.getCurrentGraph();
  let pagePath;
  if (page && graph) {
    const { path } = graph;
    if (page["journal?"]) {
      const fileName = [
        `${page.journalDay}`.substring(0, 4),
        `${page.journalDay}`.substring(4, 6),
        `${page.journalDay}`.substring(6),
      ].join("_");
      pagePath = `${path}/journals/${fileName}.md`;
    } else {
      const fileName = page.originalName
        .replace(/^\//, "")
        .replace(/\/$/, "")
        .replace(/\//g, ".")
        .replace(/[:*?"<>|]+/g, "_")
        .replace(/[\\#|%]+/g, "_");
      pagePath = `${path}/pages/${fileName}.md`;
    }

    copyTextStore.setTitle("Copy Path");
    copyTextStore.setContent(pagePath);
    copyTextStore.show();
  }

  // navigator.platform.includes("Mac")
}

export async function rename(pageName: string) {
  const currentPage = await logseq.Editor.getCurrentPage();
  if (currentPage) {
    await logseq.Editor.renamePage(currentPage.name, pageName);
    logseq.UI.showMsg(`Page renamed to ${pageName}`);
  } else {
    logseq.UI.showMsg("Rename command only work on a page.");
  }
}

export function write() {
  logseq.UI.showMsg("Actually Logseq save your info automatically!");
}

export function writeAndQuit() {
  logseq.UI.showMsg(
    "Actually Logseq save your info automatically! So just quit VIM command mode."
  );
  hideMainUI();
}

export function quit() {
  logseq.UI.showMsg("Quit VIM command mode.");
  hideMainUI();
}

export async function substituteBlock(value) {
  const splitReplace = value.trim().split("/");
  const search = splitReplace[1];
  if (search) {
    const replace = parseEscapeSequences(splitReplace[2]) || "";
    const modifiers = splitReplace[3] || "";
    const regex = new RegExp(search, modifiers);
    const block = await logseq.Editor.getCurrentBlock();
    if (block && block.uuid && block.content) {
      await replaceBlock(block, regex, replace);
      await logseq.UI.showMsg(
        'Current block replaced "' + search + '" with "' + replace + '"'
      );
      hideMainUI();
    } else {
      await logseq.UI.showMsg(
        "Current block not found. Please select a block first."
      );
    }
  } else {
    await logseq.UI.showMsg('Please input "s/search/replace/modifiers"');
  }
}

export async function substitutePage(value) {
  const blocks = await logseq.Editor.getCurrentPageBlocksTree();
  if (blocks.length > 0) {
    const splitReplace = value.trim().split("/");
    const search = splitReplace[1];
    if (search) {
      const replace = parseEscapeSequences(splitReplace[2]) || "";
      const modifiers = splitReplace[3] || "";
      const regex = new RegExp(search, modifiers);
      await walkReplace(blocks, regex, replace);
      await logseq.UI.showMsg(
        'Current page blocks replaced "' + search + '" with "' + replace + '"'
      );
      hideMainUI();
    } else {
      await logseq.UI.showMsg('Please input "%s/search/replace/modifiers"');
    }
  } else {
    await logseq.UI.showMsg(
      "Current page blocks not found. Please select a page first."
    );
  }
}

export async function clearHighlights() {
  await clearCurrentPageBlocksHighlight();
}
