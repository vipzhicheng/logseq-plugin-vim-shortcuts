import { hideMainUI } from "@/common/funcs";
import "@logseq/libs";
import { useCopyTextStore } from "@/stores/copy-text";

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

export async function openInVSCode() {
  const page = await logseq.Editor.getCurrentPage();
  const graph = await logseq.App.getCurrentGraph();
  let pagePath;
  if (page && graph) {
    const { path } = graph;
    if (page["journal?"]) {
      pagePath = `${path}/journals/${page.originalName}.md`.replace(/-/g, "_");
    } else {
      pagePath = `${path}/pages/${page.originalName}.md`;
    }

    window.open(`vscode://file/${pagePath}`, "_blank");
  }
}

export async function copyPath() {
  const copyTextStore = useCopyTextStore();
  const page = await logseq.Editor.getCurrentPage();
  const graph = await logseq.App.getCurrentGraph();
  let pagePath;
  if (page && graph) {
    const { path } = graph;
    if (page["journal?"]) {
      pagePath = `${path}/journals/${page.originalName}.md`.replace(/-/g, "_");
    } else {
      pagePath = `${path}/pages/${page.originalName}.md`;
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
    logseq.App.showMsg(`Page renamed to ${pageName}`);
  } else {
    logseq.App.showMsg("Rename command only work on a page.");
  }
}

export function write() {
  logseq.App.showMsg("Actually Logseq save your info automatically!");
}

export function writeAndQuit() {
  logseq.App.showMsg(
    "Actually Logseq save your info automatically! So just quit VIM command mode."
  );
  hideMainUI();
}

export function quit() {
  logseq.App.showMsg("Quit VIM command mode.");
  hideMainUI();
}

export async function substituteBlock(value) {
  const splitReplace = value.trim().split("/");
  const search = splitReplace[1];
  if (search) {
    const replace = splitReplace[2] || "";
    const modifiers = splitReplace[3] || "";
    const regex = new RegExp(search, modifiers);
    const block = await logseq.Editor.getCurrentBlock();
    if (block && block.uuid && block.content) {
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
}

export async function substitutePage(value) {
  const blocks = await logseq.Editor.getCurrentPageBlocksTree();
  if (blocks.length > 0) {
    const splitReplace = value.trim().split("/");
    const search = splitReplace[1];
    if (search) {
      const replace = splitReplace[2] || "";
      const modifiers = splitReplace[3] || "";
      const regex = new RegExp(search, modifiers);
      await walkReplace(blocks, regex, replace);
      await logseq.App.showMsg(
        'Current page blocks replaced "' + search + '" with "' + replace + '"'
      );
      hideMainUI();
    } else {
      await logseq.App.showMsg('Please input "%s/search/replace/modifiers"');
    }
  } else {
    await logseq.App.showMsg(
      "Current page blocks not found. Please select a page first."
    );
  }
}
