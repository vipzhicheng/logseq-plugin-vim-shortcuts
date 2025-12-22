import { clearCurrentPageBlocksHighlight, hideMainUI } from "@/common/funcs";
import { BlockEntity, BlockUUID } from "@logseq/libs/dist/LSPlugin";
import { defineStore } from "pinia";

const expandParents = async (uuid: BlockUUID) => {
  const block = await logseq.Editor.getBlock(uuid);
  if (block.parent && block.parent.id !== block.page.id) {
    const parentBlock = await logseq.Editor.getBlock(block.parent.id);
    if (parentBlock["collapsed?"]) {
      await logseq.Editor.setBlockCollapsed(parentBlock.uuid, {
        flag: false,
      });
    }
    await expandParents(parentBlock.uuid);
  }
};

const flatBlocks = (blocks: BlockEntity[]) => {
  let flat = [];
  blocks.forEach((block) => {
    if (block.content) {
      flat.push({
        uuid: block.uuid,
        content: block.content.replace(
          /<mark class="vim-shortcuts-highlight">(.*?)<\/mark>/,
          "$1"
        ),
      });
    }

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

// Find all matches in all blocks
const findAllMatches = (keyword, blocks) => {
  const matches = [];

  blocks.forEach((block, blockIndex) => {
    let content = block.content;
    const searchContent = hasUpperCase(keyword) ? content : content.toLowerCase();
    const searchKeyword = hasUpperCase(keyword) ? keyword : keyword.toLowerCase();

    let position = 0;
    let matchIndex = searchContent.indexOf(searchKeyword, position);

    while (matchIndex >= 0) {
      matches.push({
        blockIndex,
        matchOffset: matchIndex,
        uuid: block.uuid,
        content: block.content,
      });

      position = matchIndex + 1;
      matchIndex = searchContent.indexOf(searchKeyword, position);
    }
  });

  return matches;
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

function processBlockSegments(tab, input, highlightOffset?: number) {
  // If highlightOffset is specified, we need to track position across segments
  if (highlightOffset !== undefined) {
    let currentPos = 0;
    for (let k = 0; k < tab.length; k++) {
      if (tab[k].includes("<")) continue;

      const segmentLength = tab[k].length;
      const segmentStart = currentPos;
      const segmentEnd = currentPos + segmentLength;

      // Check if the highlight falls within this segment
      if (highlightOffset >= segmentStart && highlightOffset < segmentEnd) {
        const offsetInSegment = highlightOffset - segmentStart;
        tab[k] = addHighlight(tab[k], input, offsetInSegment);
      }

      currentPos += segmentLength;
    }
    return tab;
  }

  // Original behavior: highlight first match in any segment
  for (let k = 0; k < tab.length; k++) {
    if (tab[k].includes("<")) continue;
    tab[k] = addHighlight(tab[k], input);
  }
  return tab;
}

function addHighlight(word: string, input: string, highlightOffset?: number) {
  // If highlightOffset is specified, only highlight that specific match
  if (highlightOffset !== undefined) {
    const startPos = highlightOffset;
    if (startPos > -1 && startPos < word.length) {
      word =
        word.substring(0, startPos) +
        `<mark class="vim-shortcuts-highlight">${word.substring(
          startPos,
          startPos + input.length
        )}</mark>` +
        word.substring(startPos + input.length);
    }
    return word;
  }

  // Original behavior: highlight first match
  const startPos = hasUpperCase(input)
    ? word.indexOf(input)
    : word.toLowerCase().indexOf(input);
  if (startPos > -1) {
    word =
      word.substring(0, startPos) +
      `<mark class="vim-shortcuts-highlight">${word.substring(
        startPos,
        startPos + input.length
      )}</mark>` +
      word.substring(startPos + input.length);
  }
  return word;
}

function highlightInput(block, input, matchOffset?: number) {
  setTimeout(() => {
    const el = top!.document.getElementById(`block-content-${block.uuid}`);

    if (el) {
      // If matchOffset is specified, we need to find the exact position in the text
      if (matchOffset !== undefined) {
        highlightAtTextOffset(el, matchOffset, input.length);
      } else {
        // Original behavior for backward compatibility
        let spanTab: Element[] = [];
        spanTab = splitTextFromHtml(el.innerHTML);
        spanTab = processBlockSegments(spanTab, input, matchOffset);
        el.innerHTML = spanTab.join("");
      }
    }
  }, 200);
}

function highlightAtTextOffset(element: HTMLElement, offset: number, length: number) {
  // Walk through all text nodes and find the one containing our offset
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );

  let currentOffset = 0;
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const nodeLength = textNode.textContent?.length || 0;

    // Check if our match starts in this text node
    if (offset >= currentOffset && offset < currentOffset + nodeLength) {
      const startInNode = offset - currentOffset;
      const endInNode = Math.min(startInNode + length, nodeLength);

      // Split the text node to insert the mark
      const beforeText = textNode.textContent?.substring(0, startInNode) || "";
      const matchText = textNode.textContent?.substring(startInNode, endInNode) || "";
      const afterText = textNode.textContent?.substring(endInNode) || "";

      const mark = document.createElement('mark');
      mark.className = 'vim-shortcuts-highlight';
      mark.textContent = matchText;

      const fragment = document.createDocumentFragment();
      if (beforeText) {
        fragment.appendChild(document.createTextNode(beforeText));
      }
      fragment.appendChild(mark);
      if (afterText) {
        fragment.appendChild(document.createTextNode(afterText));
      }

      textNode.parentNode?.replaceChild(fragment, textNode);
      return;
    }

    currentOffset += nodeLength;
  }
}

export const useSearchStore = defineStore("search", {
  state: () => ({
    visible: false,
    input: "",
    cursor: -1,
    flatedBlocks: [],
    allMatches: [], // All match positions {blockIndex, matchOffset, uuid, content}
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
          logseq.UI.showMsg("No page selected");
        }

        // Find all matches
        this.allMatches = findAllMatches(this.input, this.flatedBlocks);

        if (this.allMatches.length > 0) {
          this.cursor = 0;
          const match = this.allMatches[this.cursor];

          // add highlight tag
          await clearCurrentPageBlocksHighlight();

          if (this.input) {
            await expandParents(match.uuid);

            logseq.Editor.scrollToBlockInPage(
              this.currentPageName,
              match.uuid
            );
            highlightInput({ uuid: match.uuid }, this.input, match.matchOffset);
          }
        } else {
          logseq.UI.showMsg("Pattern not found: " + this.input);
        }

        if (hideUI) {
          hideMainUI();
        }
      }, 300);
    },

    async searchNext() {
      if (!this.input) {
        logseq.UI.showMsg("No search pattern provide, press / to input!");
        return;
      }

      // Move to next match
      this.cursor++;

      // Wrap around if we reach the end
      if (this.cursor >= this.allMatches.length) {
        logseq.UI.showMsg("search hit BOTTOM, continuing at TOP");
        this.cursor = 0;
      }

      if (this.allMatches.length > 0) {
        const match = this.allMatches[this.cursor];

        // add highlight tag
        await clearCurrentPageBlocksHighlight();

        await expandParents(match.uuid);
        logseq.Editor.scrollToBlockInPage(this.currentPageName, match.uuid);
        if (this.input) {
          highlightInput({ uuid: match.uuid }, this.input, match.matchOffset);
        }
      } else {
        logseq.UI.showMsg("No matches found");
      }
    },

    async searchPrev() {
      if (!this.input) {
        logseq.UI.showMsg("No search pattern provide, press / to input!");
        return;
      }

      // Move to previous match
      this.cursor--;

      // Wrap around if we reach the beginning
      if (this.cursor < 0) {
        logseq.UI.showMsg("search hit TOP, continuing at BOTTOM");
        this.cursor = this.allMatches.length - 1;
      }

      if (this.allMatches.length > 0) {
        const match = this.allMatches[this.cursor];

        // add highlight tag
        await clearCurrentPageBlocksHighlight();

        await expandParents(match.uuid);
        logseq.Editor.scrollToBlockInPage(this.currentPageName, match.uuid);
        if (this.input) {
          highlightInput({ uuid: match.uuid }, this.input, match.matchOffset);
        }
      } else {
        logseq.UI.showMsg("No matches found");
      }
    },
  },
});
