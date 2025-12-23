import { clearCurrentPageBlocksHighlight, hideMainUI } from "@/common/funcs";
import { BlockEntity, BlockUUID } from "@logseq/libs/dist/LSPlugin";
import { defineStore } from "pinia";

// Track pending highlight timeout to prevent multiple highlights
let pendingHighlightTimeout: number | null = null;

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

async function highlightInput(block, input, matchOffset?: number) {
  // Cancel any pending highlight operation
  if (pendingHighlightTimeout !== null) {
    clearTimeout(pendingHighlightTimeout);
    pendingHighlightTimeout = null;
  }

  // Clear all existing highlights immediately (synchronously)
  await clearCurrentPageBlocksHighlight();

  // Schedule new highlight with a small delay
  pendingHighlightTimeout = setTimeout(async () => {
    const el = top!.document.getElementById(`block-content-${block.uuid}`);

    if (el) {
      // If matchOffset is specified, we need to find the exact position in the text
      if (matchOffset !== undefined) {
        // Get the block to access original content
        const blockData = await logseq.Editor.getBlock(block.uuid);
        if (blockData) {
          // Map original position to rendered position
          const renderedOffset = mapToRenderedPosition(blockData.content, matchOffset);

          // If we got a valid rendered position, use it
          if (renderedOffset !== undefined && renderedOffset !== -1) {
            highlightAtTextOffset(el, renderedOffset, input.length);
          } else {
            // Fallback: try to highlight at original position
            highlightAtTextOffset(el, matchOffset, input.length);
          }
        } else {
          // Fallback if we can't get block data
          highlightAtTextOffset(el, matchOffset, input.length);
        }
      } else {
        // Original behavior for backward compatibility
        let spanTab: Element[] = [];
        spanTab = splitTextFromHtml(el.innerHTML);
        spanTab = processBlockSegments(spanTab, input, matchOffset);
        el.innerHTML = spanTab.join("");
      }
    }
    pendingHighlightTimeout = null;
  }, 50) as unknown as number;
}

// Build a map from original content position to rendered text position
function buildPositionMap(originalContent: string) {
  // Map: original position -> rendered position
  // For invisible characters in original, map to -1
  const map: number[] = [];

  let renderedPos = 0;
  let inMarkdown = false;
  let markdownChar = '';
  let i = 0;

  // First, detect and remove Logseq block properties (they are invisible in UI)
  // Properties format: \nproperty-name:: value\n
  // They appear after the first line and start with a newline
  const lines = originalContent.split('\n');

  // Build a set of invisible ranges for block properties
  const invisibleRanges: Array<{start: number, end: number}> = [];
  let currentPos = 0;
  let firstPropertyIndex = -1; // Track where properties start

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const lineStart = currentPos;
    const lineEnd = currentPos + line.length;

    // Check if this line is a property (format: key:: value)
    // Properties are always after the first line
    if (lineIdx > 0 && /^[a-zA-Z0-9_-]+::\s*.+$/.test(line.trim())) {
      // Mark the first property line index
      if (firstPropertyIndex === -1) {
        firstPropertyIndex = lineIdx;
      }

      // This entire line including the newline before it is invisible
      invisibleRanges.push({
        start: lineStart - 1, // Include the \n before the property
        end: lineEnd
      });
    }

    currentPos = lineEnd + 1; // +1 for the \n
  }

  // Helper function to check if position is in an invisible property range
  const isInPropertyRange = (pos: number): boolean => {
    return invisibleRanges.some(range => pos >= range.start && pos <= range.end);
  };

  // Calculate content end position (before properties start)
  // If there are no properties, contentEndPos is the end of the string
  let contentEndPos = originalContent.length;
  if (firstPropertyIndex !== -1) {
    // Find the position of the first property line
    let pos = 0;
    for (let i = 0; i < firstPropertyIndex; i++) {
      pos += lines[i].length + 1; // +1 for \n
    }
    contentEndPos = pos - 1; // -1 to exclude the \n before first property
  }

  // Now build the position map
  while (i < originalContent.length) {
    const char = originalContent[i];

    // Skip if in property range
    if (isInPropertyRange(i)) {
      map[i] = -1;
      i++;
      continue;
    }

    // Check for newline within block content (multi-line blocks)
    // In Logseq, newlines within block content are rendered as <br> tags
    // So the \n character itself is invisible
    // Only mark \n as invisible if it's before the properties section
    if (char === '\n' && i < contentEndPos) {
      // This is a newline within the visible content, mark as invisible
      // (it becomes a <br> tag in HTML)
      map[i] = -1;
      i++;
      continue;
    }

    // Detect markdown syntax that becomes invisible
    // Inline code: `text` -> <code>text</code>
    // Bold: **text** or __text__ -> <b>text</b>
    // Italic: *text* or _text_ -> <i>text</i>
    // Strikethrough: ~~text~~ -> <s>text</s>
    // Logseq links: [[page]] -> <a>page</a>
    // URL links: <https://url> -> <a>https://url</a>
    // Logseq tags: #tag -> <a>#tag</a> (# is visible)

    if (!inMarkdown) {
      // Check for URL link <https://...> or <http://...>
      if (char === '<' && i + 1 < originalContent.length) {
        // Look ahead to see if this is a URL
        const restOfString = originalContent.substring(i + 1);
        if (restOfString.startsWith('http://') || restOfString.startsWith('https://')) {
          map[i] = -1; // < is invisible
          inMarkdown = true;
          markdownChar = '<url>';
          i++;
          continue;
        }
      }
      // Check for Logseq page link [[page]]
      else if (i + 1 < originalContent.length && originalContent.substring(i, i + 2) === '[[') {
        map[i] = -1;
        map[i + 1] = -1;
        inMarkdown = true;
        markdownChar = '[[';
        i += 2;
        continue;
      }
      // Check for start of markdown syntax
      else if (char === '`') {
        map[i] = -1; // backtick is invisible
        inMarkdown = true;
        markdownChar = '`';
        i++;
        continue;
      } else if (i + 1 < originalContent.length) {
        const twoChar = originalContent.substring(i, i + 2);
        if (twoChar === '**' || twoChar === '__' || twoChar === '~~') {
          map[i] = -1;
          map[i + 1] = -1;
          inMarkdown = true;
          markdownChar = twoChar;
          i += 2;
          continue;
        } else if (char === '*' || char === '_') {
          // Single char markdown
          map[i] = -1;
          inMarkdown = true;
          markdownChar = char;
          i++;
          continue;
        }
      }
    } else {
      // Check for end of markdown syntax
      if (markdownChar === '<url>') {
        // Look for closing >
        if (char === '>') {
          map[i] = -1; // > is invisible
          inMarkdown = false;
          markdownChar = '';
          i++;
          continue;
        } else {
          // Inside <...>, content is visible
          map[i] = renderedPos;
          renderedPos++;
          i++;
          continue;
        }
      } else if (markdownChar === '[[') {
        // Look for closing ]]
        if (i + 1 < originalContent.length && originalContent.substring(i, i + 2) === ']]') {
          map[i] = -1;
          map[i + 1] = -1;
          inMarkdown = false;
          markdownChar = '';
          i += 2;
          continue;
        } else {
          // Inside [[...]], content is visible
          map[i] = renderedPos;
          renderedPos++;
          i++;
          continue;
        }
      } else if (markdownChar === '`' && char === '`') {
        map[i] = -1;
        inMarkdown = false;
        markdownChar = '';
        i++;
        continue;
      } else if (markdownChar.length === 2) {
        if (i + 1 < originalContent.length && originalContent.substring(i, i + 2) === markdownChar) {
          map[i] = -1;
          map[i + 1] = -1;
          inMarkdown = false;
          markdownChar = '';
          i += 2;
          continue;
        }
      } else if (markdownChar.length === 1 && char === markdownChar) {
        map[i] = -1;
        inMarkdown = false;
        markdownChar = '';
        i++;
        continue;
      }
    }

    // Regular visible character
    map[i] = renderedPos;
    renderedPos++;
    i++;
  }

  return map;
}

// Map original position to rendered position, skipping invisible characters
function mapToRenderedPosition(originalContent: string, originalOffset: number) {
  const positionMap = buildPositionMap(originalContent);
  let renderedOffset = positionMap[originalOffset];

  // If the offset points to an invisible character, find the next visible one
  if (renderedOffset === -1 || renderedOffset === undefined) {
    // Search forward for next visible character
    for (let i = originalOffset + 1; i < positionMap.length; i++) {
      if (positionMap[i] !== -1 && positionMap[i] !== undefined) {
        renderedOffset = positionMap[i];
        break;
      }
    }
    // If still not found, search backward
    if (renderedOffset === -1 || renderedOffset === undefined) {
      for (let i = originalOffset - 1; i >= 0; i--) {
        if (positionMap[i] !== -1 && positionMap[i] !== undefined) {
          renderedOffset = positionMap[i];
          break;
        }
      }
    }
  }

  return renderedOffset;
}

// Find next visible character position in original content
function findNextVisiblePosition(originalContent: string, currentPos: number): number {
  const positionMap = buildPositionMap(originalContent);

  // Search forward for next visible character
  for (let i = currentPos + 1; i < originalContent.length; i++) {
    if (positionMap[i] !== -1 && positionMap[i] !== undefined) {
      return i;
    }
  }

  return currentPos; // No next visible position found
}

// Find previous visible character position in original content
function findPrevVisiblePosition(originalContent: string, currentPos: number): number {
  const positionMap = buildPositionMap(originalContent);

  // Search backward for previous visible character
  for (let i = currentPos - 1; i >= 0; i--) {
    if (positionMap[i] !== -1 && positionMap[i] !== undefined) {
      return i;
    }
  }

  return currentPos; // No previous visible position found
}

// Normalize position to ensure it's on a visible character
function normalizeToVisiblePosition(originalContent: string, pos: number): number {
  const positionMap = buildPositionMap(originalContent);

  // If current position is visible, return it
  if (positionMap[pos] !== -1 && positionMap[pos] !== undefined) {
    return pos;
  }

  // Otherwise, find next visible position
  for (let i = pos + 1; i < originalContent.length; i++) {
    if (positionMap[i] !== -1 && positionMap[i] !== undefined) {
      return i;
    }
  }

  // If not found forward, search backward
  for (let i = pos - 1; i >= 0; i--) {
    if (positionMap[i] !== -1 && positionMap[i] !== undefined) {
      return i;
    }
  }

  return pos; // Fallback
}

// Check if a position is on a visible character
function isVisiblePosition(originalContent: string, pos: number): boolean {
  const positionMap = buildPositionMap(originalContent);
  return positionMap[pos] !== -1 && positionMap[pos] !== undefined;
}

function highlightAtTextOffset(element: HTMLElement, offset: number, length: number) {
  // Get all text nodes first (before any DOM modification)
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Node | null;
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }

  // Find the target text node
  let currentOffset = 0;
  for (const textNode of textNodes) {
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
    isSearching: false, // Flag to prevent concurrent searches
    // Aggressive cursor mode
    cursorMode: false, // Whether in cursor mode
    cursorBlockUUID: "", // Current block UUID for cursor
    cursorPosition: 0, // Current cursor position (character index)
    cursorBlockContent: "", // Content of the current cursor block
    // Character search mode (f/t commands)
    waitingForChar: false, // Whether waiting for character input
    charSearchMode: "", // "f" or "F"
    // Last character search
    lastCharSearchMode: "", // "f" or "F"
    lastCharSearchChar: "", // The character that was searched
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
        // Prevent concurrent searches
        if (this.isSearching) {
          return;
        }

        // Clear highlights if input is empty
        if (!this.input || this.input.trim() === "") {
          await clearCurrentPageBlocksHighlight();
          this.cursor = -1;
          this.allMatches = [];
          this.flatedBlocks = [];
          return;
        }

        this.isSearching = true;
        try {
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
            return;
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
        } finally {
          this.isSearching = false;
        }
      }, 300);
    },

    async searchNext() {
      if (!this.input) {
        logseq.UI.showMsg("No search pattern provide, press / to input!");
        return;
      }

      // Check if we need to re-validate the cache
      // If the current match's block content has changed, invalidate and re-search
      if (this.allMatches.length > 0 && this.cursor >= 0 && this.cursor < this.allMatches.length) {
        const currentMatch = this.allMatches[this.cursor];
        const block = await logseq.Editor.getBlock(currentMatch.uuid);

        if (block && block.content !== currentMatch.content) {
          // Content has changed, invalidate cache and re-search
          await this.search(false);
          return;
        }
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

      // Check if we need to re-validate the cache
      // If the current match's block content has changed, invalidate and re-search
      if (this.allMatches.length > 0 && this.cursor >= 0 && this.cursor < this.allMatches.length) {
        const currentMatch = this.allMatches[this.cursor];
        const block = await logseq.Editor.getBlock(currentMatch.uuid);

        if (block && block.content !== currentMatch.content) {
          // Content has changed, invalidate cache and re-search
          await this.search(false);
          return;
        }
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

    // Get current match information
    getCurrentMatch() {
      if (this.cursor >= 0 && this.cursor < this.allMatches.length) {
        return this.allMatches[this.cursor];
      }
      // If in cursor mode, return cursor as a match
      if (this.cursorMode && this.cursorBlockUUID) {
        return {
          uuid: this.cursorBlockUUID,
          matchOffset: this.cursorPosition,
          content: this.cursorBlockContent,
        };
      }
      return null;
    },

    // Clear cursor mode
    clearCursor() {
      this.cursorMode = false;
      this.cursorBlockUUID = "";
      this.cursorPosition = 0;
      this.cursorBlockContent = "";
    },

    // Move cursor right (l key)
    async moveCursorRight() {
      const blockUUID = await logseq.Editor.getCurrentBlock().then(b => b?.uuid);
      if (!blockUUID) return;

      const block = await logseq.Editor.getBlock(blockUUID);
      if (!block) return;

      // If switching from search mode or starting cursor mode
      if (!this.cursorMode || this.cursorBlockUUID !== blockUUID) {
        // Check if we're in search mode with a match on this block
        const searchMatch = this.cursor >= 0 && this.cursor < this.allMatches.length
          ? this.allMatches[this.cursor]
          : null;

        if (searchMatch && searchMatch.uuid === blockUUID && this.input) {
          // Start from search match position
          this.cursorMode = true;
          this.cursorBlockUUID = blockUUID;
          this.cursorBlockContent = block.content;
          // Normalize to visible position
          this.cursorPosition = normalizeToVisiblePosition(block.content, searchMatch.matchOffset);
          // Clear search mode
          this.input = "";
          this.cursor = -1;
          this.allMatches = [];
        } else {
          // Start from beginning (first visible character)
          this.cursorMode = true;
          this.cursorBlockUUID = blockUUID;
          this.cursorBlockContent = block.content;
          this.cursorPosition = normalizeToVisiblePosition(block.content, 0);
        }
      } else {
        // Move cursor right to next visible character
        const nextPos = findNextVisiblePosition(block.content, this.cursorPosition);
        if (nextPos !== this.cursorPosition) {
          this.cursorPosition = nextPos;
        }
      }

      // Show cursor (clearCurrentPageBlocksHighlight is now handled inside highlightInput)
      highlightInput({ uuid: blockUUID }, this.getCursorChar(), this.cursorPosition);
    },

    // Move cursor left (h key)
    async moveCursorLeft() {
      if (!this.cursorMode) return;

      const blockUUID = await logseq.Editor.getCurrentBlock().then(b => b?.uuid);
      if (!blockUUID || this.cursorBlockUUID !== blockUUID) return;

      const block = await logseq.Editor.getBlock(blockUUID);
      if (!block) return;

      // Move cursor left to previous visible character
      const prevPos = findPrevVisiblePosition(block.content, this.cursorPosition);
      if (prevPos !== this.cursorPosition) {
        this.cursorPosition = prevPos;

        // Show cursor at new position
        highlightInput({ uuid: blockUUID }, this.getCursorChar(), this.cursorPosition);
      }
    },

    // Move cursor down (j key) - switch to next block
    async moveCursorDown() {
      if (!this.cursorMode) return;

      // Move to next block
      const currentBlock = await logseq.Editor.getCurrentBlock();
      if (!currentBlock) return;

      // Try to move down (simulate 'j' key)
      // We need to find the next block and switch to it
      const nextBlock = await logseq.Editor.getNextSiblingBlock(currentBlock.uuid);
      if (nextBlock) {
        await logseq.Editor.selectBlock(nextBlock.uuid);

        // Update cursor to new block
        this.cursorBlockUUID = nextBlock.uuid;
        this.cursorBlockContent = nextBlock.content;

        // Normalize position to visible character
        if (this.cursorPosition >= nextBlock.content.length) {
          // Start from end and find last visible position
          this.cursorPosition = normalizeToVisiblePosition(nextBlock.content, Math.max(0, nextBlock.content.length - 1));
        } else {
          // Normalize current position
          this.cursorPosition = normalizeToVisiblePosition(nextBlock.content, this.cursorPosition);
        }

        // Show cursor
        if (nextBlock.content.length > 0) {
          highlightInput({ uuid: nextBlock.uuid }, this.getCursorChar(), this.cursorPosition);
        }
      }
    },

    // Move cursor up (k key) - switch to previous block
    async moveCursorUp() {
      if (!this.cursorMode) return;

      // Move to previous block
      const currentBlock = await logseq.Editor.getCurrentBlock();
      if (!currentBlock) return;

      // Try to move up
      const prevBlock = await logseq.Editor.getPreviousSiblingBlock(currentBlock.uuid);
      if (prevBlock) {
        await logseq.Editor.selectBlock(prevBlock.uuid);

        // Update cursor to new block
        this.cursorBlockUUID = prevBlock.uuid;
        this.cursorBlockContent = prevBlock.content;

        // Normalize position to visible character
        if (this.cursorPosition >= prevBlock.content.length) {
          // Start from end and find last visible position
          this.cursorPosition = normalizeToVisiblePosition(prevBlock.content, Math.max(0, prevBlock.content.length - 1));
        } else {
          // Normalize current position
          this.cursorPosition = normalizeToVisiblePosition(prevBlock.content, this.cursorPosition);
        }

        // Show cursor
        if (prevBlock.content.length > 0) {
          highlightInput({ uuid: prevBlock.uuid }, this.getCursorChar(), this.cursorPosition);
        }
      }
    },

    // Get character at cursor position
    getCursorChar() {
      if (!this.cursorBlockContent || this.cursorPosition >= this.cursorBlockContent.length) {
        return "";
      }
      return this.cursorBlockContent.charAt(this.cursorPosition);
    },

    // Helper: Check if character is a word character
    isWordChar(char: string) {
      return /\w/.test(char);
    },

    // Move to start of next word (w)
    async moveWordForward() {
      if (!this.cursorMode) return;

      const blockUUID = await logseq.Editor.getCurrentBlock().then(b => b?.uuid);
      if (!blockUUID || this.cursorBlockUUID !== blockUUID) return;

      const content = this.cursorBlockContent;
      let pos = this.cursorPosition;

      // Skip current word (only count visible characters)
      while (pos < content.length) {
        if (isVisiblePosition(content, pos) && this.isWordChar(content[pos])) {
          pos++;
        } else if (!isVisiblePosition(content, pos)) {
          pos++; // Skip invisible character
        } else {
          break;
        }
      }

      // Skip whitespace (only count visible characters)
      while (pos < content.length) {
        if (isVisiblePosition(content, pos) && /\s/.test(content[pos])) {
          pos++;
        } else if (!isVisiblePosition(content, pos)) {
          pos++; // Skip invisible character
        } else {
          break;
        }
      }

      // Normalize to visible position
      if (pos < content.length) {
        this.cursorPosition = normalizeToVisiblePosition(content, pos);
        highlightInput({ uuid: blockUUID }, this.getCursorChar(), this.cursorPosition);
      }
    },

    // Move to start of previous word (b)
    async moveWordBackward() {
      if (!this.cursorMode) return;

      const blockUUID = await logseq.Editor.getCurrentBlock().then(b => b?.uuid);
      if (!blockUUID || this.cursorBlockUUID !== blockUUID) return;

      const content = this.cursorBlockContent;
      let pos = this.cursorPosition;

      // Move back one position if at start of word
      if (pos > 0) {
        pos--;
      }

      // Skip invisible characters backwards
      while (pos > 0 && !isVisiblePosition(content, pos)) {
        pos--;
      }

      // Skip whitespace backwards (only visible)
      while (pos > 0) {
        if (isVisiblePosition(content, pos) && /\s/.test(content[pos])) {
          pos--;
        } else if (!isVisiblePosition(content, pos)) {
          pos--; // Skip invisible character
        } else {
          break;
        }
      }

      // Skip to start of word (only visible)
      while (pos > 0) {
        const prevPos = pos - 1;
        if (isVisiblePosition(content, prevPos) && this.isWordChar(content[prevPos])) {
          pos--;
        } else if (!isVisiblePosition(content, prevPos)) {
          pos--; // Skip invisible character
        } else {
          break;
        }
      }

      this.cursorPosition = normalizeToVisiblePosition(content, pos);
      highlightInput({ uuid: blockUUID }, this.getCursorChar(), this.cursorPosition);
    },

    // Move to end of word (e)
    async moveWordEnd() {
      if (!this.cursorMode) return;

      const blockUUID = await logseq.Editor.getCurrentBlock().then(b => b?.uuid);
      if (!blockUUID || this.cursorBlockUUID !== blockUUID) return;

      const content = this.cursorBlockContent;
      let pos = this.cursorPosition;

      // Move forward one position
      if (pos < content.length - 1) {
        pos++;
      }

      // Skip invisible characters
      while (pos < content.length && !isVisiblePosition(content, pos)) {
        pos++;
      }

      // Skip whitespace (only visible)
      while (pos < content.length) {
        if (isVisiblePosition(content, pos) && /\s/.test(content[pos])) {
          pos++;
        } else if (!isVisiblePosition(content, pos)) {
          pos++; // Skip invisible character
        } else {
          break;
        }
      }

      // Skip to end of word (only visible)
      while (pos < content.length - 1) {
        const nextPos = pos + 1;
        if (isVisiblePosition(content, nextPos) && this.isWordChar(content[nextPos])) {
          pos++;
        } else if (!isVisiblePosition(content, nextPos)) {
          pos++; // Skip invisible character
        } else {
          break;
        }
      }

      this.cursorPosition = normalizeToVisiblePosition(content, pos);
      highlightInput({ uuid: blockUUID }, this.getCursorChar(), this.cursorPosition);
    },

    // Move to line start (0)
    async moveLineStart() {
      if (!this.cursorMode) return;

      const blockUUID = await logseq.Editor.getCurrentBlock().then(b => b?.uuid);
      if (!blockUUID || this.cursorBlockUUID !== blockUUID) return;

      const block = await logseq.Editor.getBlock(blockUUID);
      if (!block) return;

      // Move to first visible character
      this.cursorPosition = normalizeToVisiblePosition(block.content, 0);
      highlightInput({ uuid: blockUUID }, this.getCursorChar(), this.cursorPosition);
    },

    // Move to line end ($)
    async moveLineEnd() {
      if (!this.cursorMode) return;

      const blockUUID = await logseq.Editor.getCurrentBlock().then(b => b?.uuid);
      if (!blockUUID || this.cursorBlockUUID !== blockUUID) return;

      const block = await logseq.Editor.getBlock(blockUUID);
      if (!block) return;

      const content = block.content;
      // Move to last visible character
      this.cursorPosition = normalizeToVisiblePosition(content, Math.max(0, content.length - 1));
      highlightInput({ uuid: blockUUID }, this.getCursorChar(), this.cursorPosition);
    },

    // Find character forward (f)
    async findCharForward(char: string, recordHistory: boolean = true) {
      if (!this.cursorMode) return;

      const blockUUID = await logseq.Editor.getCurrentBlock().then(b => b?.uuid);
      if (!blockUUID || this.cursorBlockUUID !== blockUUID) return;

      const content = this.cursorBlockContent;

      // Search forward for the character, but only at visible positions
      for (let i = this.cursorPosition + 1; i < content.length; i++) {
        if (isVisiblePosition(content, i) && content[i] === char) {
          this.cursorPosition = i;
          highlightInput({ uuid: blockUUID }, this.getCursorChar(), this.cursorPosition);

          // Record this search for ; and , commands
          if (recordHistory) {
            this.lastCharSearchMode = "f";
            this.lastCharSearchChar = char;
          }
          return;
        }
      }
    },

    // Find character backward (F)
    async findCharBackward(char: string, recordHistory: boolean = true) {
      if (!this.cursorMode) return;

      const blockUUID = await logseq.Editor.getCurrentBlock().then(b => b?.uuid);
      if (!blockUUID || this.cursorBlockUUID !== blockUUID) return;

      const content = this.cursorBlockContent;

      // Search backward for the character, but only at visible positions
      for (let i = this.cursorPosition - 1; i >= 0; i--) {
        if (isVisiblePosition(content, i) && content[i] === char) {
          this.cursorPosition = i;
          highlightInput({ uuid: blockUUID }, this.getCursorChar(), this.cursorPosition);

          // Record this search for ; and , commands
          if (recordHistory) {
            this.lastCharSearchMode = "F";
            this.lastCharSearchChar = char;
          }
          return;
        }
      }
    },

    // Start waiting for character (for f/F commands)
    startCharSearch(mode: string) {
      this.waitingForChar = true;
      this.charSearchMode = mode;
      const direction = mode === 'F' ? 'backward' : 'forward';
      logseq.UI.showMsg(`Press a character to find ${direction}`, "info");
    },

    // Handle character input
    async handleCharInput(char: string) {
      if (!this.waitingForChar) return;

      this.waitingForChar = false;
      const mode = this.charSearchMode;
      this.charSearchMode = "";

      if (mode === "f") {
        await this.findCharForward(char);
      } else if (mode === "F") {
        await this.findCharBackward(char);
      }
    },

    // Cancel character search
    cancelCharSearch() {
      this.waitingForChar = false;
      this.charSearchMode = "";
    },

    // Repeat last character search in same direction (;)
    async repeatCharSearch() {
      if (!this.lastCharSearchChar || !this.lastCharSearchMode) {
        logseq.UI.showMsg("No previous character search", "warning");
        return;
      }

      if (this.lastCharSearchMode === "f") {
        await this.findCharForward(this.lastCharSearchChar, false);
      } else if (this.lastCharSearchMode === "F") {
        await this.findCharBackward(this.lastCharSearchChar, false);
      }
    },

    // Repeat last character search in opposite direction (,)
    async repeatCharSearchReverse() {
      if (!this.lastCharSearchChar || !this.lastCharSearchMode) {
        logseq.UI.showMsg("No previous character search", "warning");
        return;
      }

      // Reverse the direction
      if (this.lastCharSearchMode === "f") {
        await this.findCharBackward(this.lastCharSearchChar, false);
      } else if (this.lastCharSearchMode === "F") {
        await this.findCharForward(this.lastCharSearchChar, false);
      }
    },
  },
});
