import { clearCurrentPageBlocksHighlight, hideMainUI } from "@/common/funcs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin";
import { defineStore } from "pinia";

const flatBlocks = (blocks: BlockEntity[]) => {
  let flat = [];
  blocks.forEach((block) => {
    flat.push({
      uuid: block.uuid,
      content: block.content
        .replace(/ <mark class="vim-shortcuts-highlight">(.*?)<\/mark>/, "$1")
        .replace(/<mark class="vim-shortcuts-highlight">(.*?)<\/mark>/, "$1"),
    });

    if (block.children) {
      flat = flat.concat(flatBlocks(block.children as BlockEntity[]));
    }
  });

  return flat;
};

// Check if keyword has upper case
const hasUpperCase = (keyword) => {
  return keyword.toLowerCase() !== keyword;
};

const searchBlock = (keyword, blocks, cursor = -1, dir = "next") => {
  let newCursor;
  if (dir === "next") {
    if (cursor >= blocks.length - 1) {
      return -1;
    }
    const rangeBlocks = blocks.slice(cursor + 1);
    const found = rangeBlocks.findIndex((block) => {
      let content = block.content;
      if (!hasUpperCase(keyword)) {
        content = content.toLowerCase();
      }

      return content.indexOf(keyword) >= 0;
    });

    if (found >= 0) {
      newCursor = blocks.findIndex(
        (block) => block.uuid === rangeBlocks[found].uuid
      );
    } else {
      return -1;
    }
  } else {
    if (cursor <= 0) {
      return -1;
    }
    const rangeBlocks = blocks.slice(0, cursor).reverse();
    const found = rangeBlocks.findIndex((block) => {
      let content = block.content;
      if (!hasUpperCase(keyword)) {
        content = content.toLowerCase();
      }
      return content.indexOf(keyword) >= 0;
    });

    if (found >= 0) {
      newCursor = blocks.findIndex(
        (block) => block.uuid === rangeBlocks[found].uuid
      );
    } else {
      return -1;
    }
  }

  return newCursor;
};

function splitTextFromHtml(htmlStr) {
  let tab: number[] = [];
  tab = getAllIndexOf("<", ">", htmlStr);
  let splitTab: HTMLElement[] = [];
  let shiftL = 0;
  let shiftR = 1;
  for (let i = 0; i < tab.length - 1; i++) {
    splitTab.push(htmlStr.substring(tab[i] + shiftL, tab[i + 1] + shiftR));
    let x = shiftR;
    shiftR = shiftL;
    shiftL = x;
  }
  return splitTab;
}

function getAllIndexOf(s1, s2, str) {
  let index = 0;
  let tab: number[] = [];
  while (index != -1) {
    index = str.indexOf(s1, index);
    if (index == -1) break;
    tab.push(index);
    index = str.indexOf(s2, index);
    tab.push(index);
  }
  return tab;
}

function processBlockSegments(tab, input) {
  for (let k = 0; k < tab.length; k++) {
    if (tab[k].includes("<")) continue;
    tab[k] = addHighlight(tab[k], input);
  }
  return tab;
}

function addHighlight(word: string, input: string) {
  const startPos = hasUpperCase(input)
    ? word.indexOf(input)
    : word.toLowerCase().indexOf(input);
  if (startPos > -1) {
    word =
      word.substring(0, startPos) +
      `<mark class="vim-shortcuts-highlight">${input}</mark>` +
      word.substring(startPos + input.length);
  }
  return word;
}

function highlightInput(block, input) {
  const el = top!.document.getElementById(`block-content-${block.uuid}`);

  let spanTab: Element[] = [];
  spanTab = splitTextFromHtml(el.innerHTML);
  spanTab = processBlockSegments(spanTab, input);
  el.innerHTML = spanTab.join("");
}

export const useSearchStore = defineStore("search", {
  state: () => ({
    visible: false,
    input: "",
    cursor: -1,
    flatedBlocks: [],
    currentPageName: "",
    timer: null,
  }),
  actions: {
    toggle() {
      this.visible = !this.visible;
    },

    show() {
      this.visible = true;
    },

    hide() {
      this.visible = false;
    },

    emptyInput() {
      this.input = "";
    },

    async search(hideUI = false) {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(async () => {
        this.cursor = -1;
        let flatedBlocks = [];
        let page = await logseq.Editor.getCurrentPage();
        if (page) {
          const blocks = await logseq.Editor.getCurrentPageBlocksTree();
          flatedBlocks = flatBlocks(blocks);
        } else {
          const block = await logseq.Editor.getCurrentBlock();
          if (block) {
            page = await logseq.Editor.getPage(block.page.id);
            const blocks = await logseq.Editor.getPageBlocksTree(page.name);
            flatedBlocks = flatBlocks(blocks);
          }
        }
        this.flatedBlocks = flatedBlocks;
        this.currentPageName = page ? page.name : "";

        if (!this.currentPageName) {
          logseq.App.showMsg("No page selected");
        }

        this.cursor = searchBlock(
          this.input,
          this.flatedBlocks,
          this.cursor,
          "next"
        );

        if (this.cursor >= 0) {
          const flatBlock = this.flatedBlocks[this.cursor];

          // add highlight tag
          await clearCurrentPageBlocksHighlight();

          if (this.input) {
            highlightInput(flatBlock, this.input);

            logseq.Editor.scrollToBlockInPage(
              this.currentPageName,
              flatBlock.uuid
            );
          }
        } else {
          logseq.App.showMsg("Pattern not found: " + this.input);
        }

        if (hideUI) {
          hideMainUI();
        }
      }, 300);
    },

    async searchNext() {
      if (!this.input) {
        logseq.App.showMsg("No search pattern provide, press / to input!");
        return;
      }

      this.cursor = searchBlock(
        this.input,
        this.flatedBlocks,
        this.cursor,
        "next"
      );

      if (this.cursor >= 0) {
        const flatBlock = this.flatedBlocks[this.cursor];

        // add highlight tag
        await clearCurrentPageBlocksHighlight();
        if (this.input) {
          highlightInput(flatBlock, this.input);
        }

        logseq.Editor.scrollToBlockInPage(this.currentPageName, flatBlock.uuid);
      } else {
        logseq.App.showMsg("search hit BOTTOM, continuing at TOP");
        this.cursor = -1;
        await this.searchNext();
      }
    },

    async searchPrev() {
      if (!this.input) {
        logseq.App.showMsg("No search pattern provide, press / to input!");
        return;
      }

      this.cursor = searchBlock(
        this.input,
        this.flatedBlocks,
        this.cursor,
        "prev"
      );

      if (this.cursor >= 0) {
        const flatBlock = this.flatedBlocks[this.cursor];

        // add highlight tag
        await clearCurrentPageBlocksHighlight();
        if (this.input) {
          highlightInput(flatBlock, this.input);
        }

        logseq.Editor.scrollToBlockInPage(this.currentPageName, flatBlock.uuid);
      } else {
        logseq.App.showMsg("search hit TOP, continuing at BOTTOM");
        this.cursor = this.flatedBlocks.length;
        await this.searchPrev();
      }
    },
  },
});
