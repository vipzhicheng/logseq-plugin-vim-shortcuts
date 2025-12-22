import { hideMainUI } from "@/common/funcs";
import "@logseq/libs";
import { format, add, sub } from "date-fns";

import { backward, forward } from "./invoke";

const parsePageName = async (pageName: string) => {
  const config = await logseq.App.getUserConfigs();
  const page = await logseq.Editor.getCurrentPage();
  switch (pageName) {
    case "@":
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
      if (page && page["journal?"]) {
        pageName = format(
          sub(new Date(page.name), {
            days: 1,
          }),
          config.preferredDateFormat
        );
        return pageName;
      } else {
        pageName = format(
          sub(new Date(), {
            days: 1,
          }),
          config.preferredDateFormat
        );
        return pageName;
      }
    case "@next":
      if (page && page["journal?"]) {
        pageName = format(
          add(new Date(page.name), {
            days: 1,
          }),
          config.preferredDateFormat
        );
        return pageName;
      } else {
        pageName = format(
          add(new Date(), {
            days: 1,
          }),
          config.preferredDateFormat
        );
        return pageName;
      }
    case "@back":
      await backward();
      return;
    case "@forward":
      await forward();
      return;
    default:
      return pageName;
  }
};

export async function goOrCreate(pageName, opts) {
  const isBlock = /\(\((.*?)\)\)/.test(pageName);

  if (!isBlock) {
    if (opts.ns || opts.namespace) {
      let currentPage = await logseq.Editor.getCurrentPage();
      if (!currentPage) {
        let block = await logseq.Editor.getCurrentBlock();
        if (block) {
          currentPage = await logseq.Editor.getPage(block.page.id);
        }
      }
      if (currentPage) {
        pageName = `${currentPage.name}/${pageName}`;
      }
    }
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
        const blocks = await logseq.Editor.getPageBlocksTree(pageName);
        logseq.App.pushState("page", {
          name: pageName,
        });
        if (blocks && blocks.length > 0) {
          logseq.Editor.editBlock(blocks[0].uuid);
        }
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
      logseq.UI.showMsg("Block not exist!");
    }
  }
  hideMainUI();
}

export async function go(pageName, opts) {
  const isBlock = /\(\((.*?)\)\)/.test(pageName);

  if (!isBlock) {
    if (opts.ns || opts.namespace) {
      let currentPage = await logseq.Editor.getCurrentPage();
      if (!currentPage) {
        let block = await logseq.Editor.getCurrentBlock();
        if (block) {
          currentPage = await logseq.Editor.getPage(block.page.id);
        }
      }
      if (currentPage) {
        pageName = `${currentPage.name}/${pageName}`;
      }
    }
    pageName = await parsePageName(pageName);
    if (pageName) {
      let page = await logseq.Editor.getPage(pageName);

      if (!page) {
        logseq.UI.showMsg(
          "Page not exist! If you want create non-exist page, use go! command."
        );
      } else {
        const blocks = await logseq.Editor.getPageBlocksTree(pageName);
        logseq.App.pushState("page", {
          name: pageName,
        });
        if (blocks && blocks.length > 0) {
          logseq.Editor.editBlock(blocks[0].uuid);
        }
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
      logseq.UI.showMsg("Block not exist!");
    }
  }
  hideMainUI();
}
