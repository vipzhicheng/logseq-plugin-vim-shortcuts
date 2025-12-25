<script lang="ts" setup>
import { ref } from "vue";
import { useMarkStore } from "@/stores/mark";
import { hideMainUI, setMark, updateBlockMarkNote, updatePageMarkNote } from "@/common/funcs";

const mark = useMarkStore();
const blockContentCache = ref<Record<string, string>>({});
const pageContentCache = ref<Record<string, string>>({});
const loadingBlocks = ref<Record<string, boolean>>({});
const loadingPages = ref<Record<string, boolean>>({});
const activeTab = ref("blocks");
const showBlocksHelp = ref(false);
const showPagesHelp = ref(false);
const editingNote = ref<string | null>(null);
const editingNoteValue = ref("");

const handleClose = async () => {
  hideMainUI();
};

const handleClick = async (mark) => {
  if (mark) {
    if (mark.block) {
      logseq.Editor.scrollToBlockInPage(mark.page, mark.block);
    } else {
      logseq.App.pushState("page", {
        name: mark.page,
      });
    }
  }
};

const handleDeleteBlockMark = async (key: string) => {
  await mark.deleteBlockMark(key);
  mark.reload();
};

const handleDeletePageMark = async (key: string) => {
  await mark.deletePageMark(key);
  mark.reload();
};

const handleClearAll = async () => {
  await mark.clearMarks();
  mark.reload();
};

const handleClearBlockMarks = async () => {
  await mark.clearBlockMarks();
  mark.reload();
};

const handleClearPageMarks = async () => {
  await mark.clearPageMarks();
  mark.reload();
};

const handleAddBlockMark = async () => {
  try {
    const page = await logseq.Editor.getCurrentPage();

    if (!page || !page.name) {
      logseq.UI.showMsg("Cannot get current page", "warning");
      return;
    }

    const block = await logseq.Editor.getCurrentBlock()

    // Ensure block has an id property
    if (!block.properties?.id) {
      await logseq.Editor.upsertBlockProperty(block.uuid, "id", block.uuid);
    }

    // Find next available mark number (only for block marks)
    const marksObj = mark.marks;
    const blockMarkNumbers = marksObj
      .filter((m: any) => m.block)
      .map((m: any) => parseInt(m.key, 10))
      .filter((n: number) => !isNaN(n));

    const nextNumber = blockMarkNumbers.length > 0
      ? Math.max(...blockMarkNumbers) + 1
      : 1;

    // Save mark
    await setMark(nextNumber, page.name as string, block.uuid);
    mark.reload();

    logseq.UI.showMsg(`Block mark ${nextNumber} saved`, "success");
  } catch (error) {
    console.error("Failed to add block mark:", error);
    logseq.UI.showMsg("Failed to add block mark", "error");
  }
};

const handleAddPageMark = async () => {
  try {
    const page = await logseq.Editor.getCurrentPage();

    if (!page || !page.name) {
      logseq.UI.showMsg("Cannot get current page", "warning");
      return;
    }

    // Find next available mark number (only for page marks)
    const marksObj = mark.marks;
    const pageMarkNumbers = marksObj
      .filter((m: any) => !m.block)
      .map((m: any) => parseInt(m.key, 10))
      .filter((n: number) => !isNaN(n));

    const nextNumber = pageMarkNumbers.length > 0
      ? Math.max(...pageMarkNumbers) + 1
      : 1;

    // Save mark
    await setMark(nextNumber, page.name as string);
    mark.reload();

    logseq.UI.showMsg(`Page mark ${nextNumber} saved`, "success");
  } catch (error) {
    console.error("Failed to add page mark:", error);
    logseq.UI.showMsg("Failed to add page mark", "error");
  }
};

const renderMarkdown = (text: string): string => {
  let html = text;

  // Remove Logseq properties (key:: value format)
  // This needs to be done before HTML escaping to work correctly
  html = html.replace(/^[\w\-]+::\s*.+$/gm, '');
  // Also remove inline properties
  html = html.replace(/[\w\-]+::\s*[^\n]+/g, '');
  // Clean up empty lines left after removing properties
  html = html.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Escape HTML to prevent XSS
  html = html.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough: ~~text~~
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Inline code: `code`
  html = html.replace(/`(.+?)`/g, '<code class="inline-code">$1</code>');

  // Highlight: ==text==
  html = html.replace(/==(.+?)==/g, '<mark class="highlight">$1</mark>');

  // Links: [text](url)
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="link" target="_blank">$1</a>');

  // Headers: # to ######
  html = html.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    return `<h${level} class="heading-${level}">${content}</h${level}>`;
  });

  // Task list: - [ ] or - [x]
  html = html.replace(/^-\s+\[([ x])\]\s+(.+)$/gm, (match, checked, content) => {
    const isChecked = checked.toLowerCase() === 'x';
    return `<span class="task-item">${isChecked ? '☑' : '☐'} ${content}</span>`;
  });

  // Unordered list: - or *
  html = html.replace(/^[-*]\s+(.+)$/gm, '<span class="list-item">• $1</span>');

  // Block quotes: > text
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="quote">$1</blockquote>');

  return html;
};

const getBlockPreview = async (blockUUID: string): Promise<string> => {
  // Check cache first
  if (blockContentCache.value[blockUUID]) {
    return blockContentCache.value[blockUUID];
  }

  // Check if already loading
  if (loadingBlocks.value[blockUUID]) {
    return "Loading...";
  }

  // Mark as loading
  loadingBlocks.value[blockUUID] = true;

  try {
    const block = await logseq.Editor.getBlock(blockUUID);
    if (block && block.content) {
      // Truncate to 200 characters before rendering
      const truncated = block.content.length > 200
        ? block.content.substring(0, 200) + "..."
        : block.content;

      // Render Markdown
      const rendered = renderMarkdown(truncated);

      // Cache the result
      blockContentCache.value[blockUUID] = rendered;
      return rendered;
    }
    return "No content available";
  } catch (error) {
    console.error("Failed to load block content:", error);
    return "Failed to load content";
  } finally {
    loadingBlocks.value[blockUUID] = false;
  }
};

const getPagePreview = async (pageName: string): Promise<string> => {
  // Check cache first
  if (pageContentCache.value[pageName]) {
    return pageContentCache.value[pageName];
  }

  // Check if already loading
  if (loadingPages.value[pageName]) {
    return "Loading...";
  }

  // Mark as loading
  loadingPages.value[pageName] = true;

  try {
    const page = await logseq.Editor.getPage(pageName);
    if (!page) {
      return "Page not found";
    }

    const blocks = await logseq.Editor.getPageBlocksTree(pageName);
    if (!blocks || blocks.length === 0) {
      return "No content available";
    }

    // Take first 5 blocks
    const firstBlocks = blocks.slice(0, 5);

    // Render blocks with indentation
    const renderBlock = (block: any, level: number = 0): string => {
      const content = block.content || '';
      const truncated = content.length > 100
        ? content.substring(0, 100) + "..."
        : content;

      let html = `<div class="block-line" style="padding-left: ${level * 16}px;">`;
      html += renderMarkdown(truncated);
      html += '</div>';

      return html;
    };

    // Recursively collect blocks with their levels
    const collectBlocks = (blocks: any[], level: number = 0, count: { value: number }): string[] => {
      const result: string[] = [];

      for (const block of blocks) {
        if (count.value >= 5) break;

        result.push(renderBlock(block, level));
        count.value++;

        if (count.value < 5 && block.children && block.children.length > 0) {
          const childResults = collectBlocks(block.children, level + 1, count);
          result.push(...childResults);
        }
      }

      return result;
    };

    const count = { value: 0 };
    const renderedBlocks = collectBlocks(firstBlocks, 0, count);
    const rendered = renderedBlocks.join('');

    // Cache the result
    pageContentCache.value[pageName] = rendered;
    return rendered;
  } catch (error) {
    console.error("Failed to load page content:", error);
    return "Failed to load content";
  } finally {
    loadingPages.value[pageName] = false;
  }
};

const startEditNote = (key: string, currentNote: string, isPageMark: boolean) => {
  editingNote.value = `${isPageMark ? 'page' : 'block'}-${key}`;
  editingNoteValue.value = currentNote || "";
};

const cancelEditNote = () => {
  editingNote.value = null;
  editingNoteValue.value = "";
};

const saveNote = async (key: string, isPageMark: boolean) => {
  if (isPageMark) {
    await updatePageMarkNote(key, editingNoteValue.value);
  } else {
    await updateBlockMarkNote(key, editingNoteValue.value);
  }
  mark.reload();
  editingNote.value = null;
  editingNoteValue.value = "";
};
</script>

<template>
  <el-drawer
    v-model="mark.visible"
    :title="mark.title"
    direction="rtl"
    @close="handleClose"
    :show-close="false"
    class="vim-shortcuts-marks"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <span class="text-lg font-semibold">{{ mark.title }}</span>
        <el-button
          size="small"
          text
          @click="mark.close"
          title="Close"
        >
          ✕
        </el-button>
      </div>
    </template>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="Blocks" name="blocks">
        <div class="flex items-center gap-2 mb-4">
          <el-button
            size="small"
            type="primary"
            text
            @click="handleAddBlockMark"
            title="Add selected block as mark"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="ml-1">Add</span>
          </el-button>
          <el-button
            size="small"
            type="info"
            text
            @click="showBlocksHelp = true"
            title="Show help"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="ml-1">Help</span>
          </el-button>
          <el-button
            size="small"
            type="danger"
            text
            @click="handleClearBlockMarks"
            title="Clear all block marks"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="ml-1">Clear All</span>
          </el-button>
        </div>

        <el-timeline>
          <el-timeline-item
            v-for="m in mark.blockMarks"
            :key="m.key"
            :icon="m.icon"
            :color="m.color"
            class="compact-timeline-item"
          >
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <el-popover
                    placement="left"
                    :width="400"
                    trigger="hover"
                    :show-after="300"
                    @show="() => getBlockPreview(m.block)"
                  >
                    <template #reference>
                      <a class="cursor-pointer mark-link" @click="handleClick(m)">
                        <span class="mark-number">{{ m.key }}</span>
                        <span class="mark-page">{{ m.page }}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 inline-block ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                            clip-rule="evenodd"
                          /></svg
                      ></a>
                    </template>
                    <template #default>
                      <div class="block-preview">
                        <div class="text-xs text-gray-500 mb-2">Block Preview:</div>
                        <div
                          class="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm break-words preview-content"
                          v-html="blockContentCache[m.block] || 'Loading...'"
                        ></div>
                      </div>
                    </template>
                  </el-popover>
                  <el-button
                    size="small"
                    type="danger"
                    text
                    @click="handleDeleteBlockMark(m.key)"
                    title="Delete mark"
                  >
                    ✕
                  </el-button>
                </div>
                <div v-if="editingNote === `block-${m.key}`" class="note-edit-container">
                  <el-input
                    v-model="editingNoteValue"
                    size="small"
                    placeholder="Add a note (optional)"
                    maxlength="50"
                    show-word-limit
                    @keyup.enter="saveNote(m.key, false)"
                    @keyup.esc="cancelEditNote"
                  />
                  <div class="flex gap-1 mt-1">
                    <el-button size="small" type="primary" @click="saveNote(m.key, false)">Save</el-button>
                    <el-button size="small" @click="cancelEditNote">Cancel</el-button>
                  </div>
                </div>
                <div v-else class="note-display" @click="startEditNote(m.key, m.note, false)">
                  <span v-if="m.note" class="note-text">{{ m.note }}</span>
                  <span v-else class="note-placeholder">Click to add note...</span>
                </div>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>

      <el-tab-pane label="Pages" name="pages">
        <div class="flex items-center gap-2 mb-4">
          <el-button
            size="small"
            type="primary"
            text
            @click="handleAddPageMark"
            title="Add current page as mark"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="ml-1">Add</span>
          </el-button>
          <el-button
            size="small"
            type="info"
            text
            @click="showPagesHelp = true"
            title="Show help"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="ml-1">Help</span>
          </el-button>
          <el-button
            size="small"
            type="danger"
            text
            @click="handleClearPageMarks"
            title="Clear all page marks"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="ml-1">Clear All</span>
          </el-button>
        </div>

        <el-timeline>
          <el-timeline-item
            v-for="m in mark.pageMarks"
            :key="m.key"
            :icon="m.icon"
            :color="m.color"
            class="compact-timeline-item"
          >
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <el-popover
                    placement="left"
                    :width="400"
                    trigger="hover"
                    :show-after="300"
                    @show="() => getPagePreview(m.page)"
                  >
                    <template #reference>
                      <a class="cursor-pointer mark-link" @click="handleClick(m)">
                        <span class="mark-number">{{ m.key }}</span>
                        <span class="mark-page">{{ m.page }}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 inline-block ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                            clip-rule="evenodd"
                          /></svg
                      ></a>
                    </template>
                    <template #default>
                      <div class="page-preview">
                        <div class="text-xs text-gray-500 mb-2">Page Preview (first 5 blocks):</div>
                        <div
                          class="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm break-words preview-content"
                          v-html="pageContentCache[m.page] || 'Loading...'"
                        ></div>
                      </div>
                    </template>
                  </el-popover>
                  <el-button
                    size="small"
                    type="danger"
                    text
                    @click="handleDeletePageMark(m.key)"
                    title="Delete mark"
                  >
                    ✕
                  </el-button>
                </div>
                <div v-if="editingNote === `page-${m.key}`" class="note-edit-container">
                  <el-input
                    v-model="editingNoteValue"
                    size="small"
                    placeholder="Add a note (optional)"
                    maxlength="50"
                    show-word-limit
                    @keyup.enter="saveNote(m.key, true)"
                    @keyup.esc="cancelEditNote"
                  />
                  <div class="flex gap-1 mt-1">
                    <el-button size="small" type="primary" @click="saveNote(m.key, true)">Save</el-button>
                    <el-button size="small" @click="cancelEditNote">Cancel</el-button>
                  </div>
                </div>
                <div v-else class="note-display" @click="startEditNote(m.key, m.note, true)">
                  <span v-if="m.note" class="note-text">{{ m.note }}</span>
                  <span v-else class="note-placeholder">Click to add note...</span>
                </div>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>
    </el-tabs>

    <!-- Block Marks Help Dialog -->
    <el-dialog
      v-model="showBlocksHelp"
      title="Block Marks Usage"
      width="500px"
    >
      <div class="help-content">
        <h3>What are Block Marks?</h3>
        <p>Block marks allow you to bookmark specific blocks in your Logseq graph for quick navigation.</p>

        <h3>How to use:</h3>
        <ul>
          <li><strong>Save a block mark:</strong> Press <code>m</code> in non-editing mode while a block is selected. You can prefix with a number (e.g., <code>5m</code>) or let it auto-increment.</li>
          <li><strong>Add from drawer:</strong> Select a block and click the "Add" button to mark it.</li>
          <li><strong>Jump to a mark:</strong> Press the mark number followed by <code>'</code> (e.g., <code>5'</code>).</li>
          <li><strong>Open in sidebar:</strong> Press the mark number followed by <code>mod+'</code>.</li>
          <li><strong>Delete a mark:</strong> Click the ✕ button next to the mark.</li>
          <li><strong>Clear all:</strong> Click "Clear All" to remove all block marks.</li>
        </ul>

        <h3>Tips:</h3>
        <ul>
          <li>Block marks are graph-specific and persist across sessions.</li>
          <li>Hover over a mark to see a preview of the block content.</li>
          <li>Block marks are shown in green in the timeline.</li>
        </ul>
      </div>
    </el-dialog>

    <!-- Page Marks Help Dialog -->
    <el-dialog
      v-model="showPagesHelp"
      title="Page Marks Usage"
      width="500px"
    >
      <div class="help-content">
        <h3>What are Page Marks?</h3>
        <p>Page marks allow you to bookmark entire pages in your Logseq graph for quick navigation.</p>

        <h3>How to use:</h3>
        <ul>
          <li><strong>Save a page mark:</strong> Press <code>M</code> (Shift+m) in non-editing mode on any page. You can prefix with a number (e.g., <code>5M</code>) or let it auto-increment.</li>
          <li><strong>Jump to a mark:</strong> Press the mark number followed by <code>"</code> (Shift+') (e.g., <code>5"</code>).</li>
          <li><strong>Open in sidebar:</strong> Press the mark number followed by <code>mod+shift+'</code>.</li>
          <li><strong>Add from drawer:</strong> Click the "Add" button to mark the current page.</li>
          <li><strong>Delete a mark:</strong> Click the ✕ button next to the mark.</li>
          <li><strong>Clear all:</strong> Click "Clear All" to remove all page marks.</li>
        </ul>

        <h3>Tips:</h3>
        <ul>
          <li>Page marks are graph-specific and persist across sessions.</li>
          <li>Hover over a mark to see a preview of the first 5 blocks.</li>
          <li>Page marks are shown in blue in the timeline.</li>
          <li>Perfect for marking frequently accessed pages like journals, MOCs, or project pages.</li>
        </ul>
      </div>
    </el-dialog>
  </el-drawer>
</template>

<style>
.block-preview,
.page-preview {
  max-width: 100%;
}

.block-preview .preview-content,
.page-preview .preview-content {
  font-family: 'Courier New', Courier, monospace;
  max-height: 300px;
  overflow-y: auto;
  line-height: 1.6;
}

/* Page preview block lines */
.preview-content .block-line {
  margin: 4px 0;
  position: relative;
}

/* Markdown rendering styles */
.preview-content strong {
  font-weight: 600;
  color: #1a1a1a;
}

.dark .preview-content strong {
  color: #e5e5e5;
}

.preview-content em {
  font-style: italic;
  color: #4a4a4a;
}

.dark .preview-content em {
  color: #d0d0d0;
}

.preview-content del {
  text-decoration: line-through;
  color: #888;
}

.preview-content .inline-code {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 0.9em;
  font-family: 'Courier New', Courier, monospace;
  color: #c7254e;
}

.dark .preview-content .inline-code {
  background: #2a2a2a;
  border-color: #444;
  color: #ff7b72;
}

.preview-content .highlight {
  background: #fff59d;
  padding: 2px 4px;
  border-radius: 2px;
}

.dark .preview-content .highlight {
  background: #806d00;
  color: #fff;
}

.preview-content .link {
  color: #0066cc;
  text-decoration: underline;
}

.dark .preview-content .link {
  color: #58a6ff;
}

.preview-content .link:hover {
  opacity: 0.8;
}

.preview-content h1,
.preview-content h2,
.preview-content h3,
.preview-content h4,
.preview-content h5,
.preview-content h6 {
  font-weight: 600;
  margin: 8px 0 4px 0;
  line-height: 1.3;
}

.preview-content h1 { font-size: 1.5em; }
.preview-content h2 { font-size: 1.3em; }
.preview-content h3 { font-size: 1.15em; }
.preview-content h4 { font-size: 1.05em; }
.preview-content h5 { font-size: 1em; }
.preview-content h6 { font-size: 0.95em; }

.preview-content .task-item {
  display: block;
  margin: 4px 0;
}

.preview-content .list-item {
  display: block;
  margin: 2px 0 2px 8px;
}

.preview-content .quote {
  display: block;
  border-left: 3px solid #0066cc;
  padding-left: 12px;
  margin: 8px 0;
  color: #555;
  font-style: italic;
}

.dark .preview-content .quote {
  border-left-color: #58a6ff;
  color: #aaa;
}

/* Reduce spacing between header and content */
.vim-shortcuts-marks .el-drawer__header {
  margin-bottom: 8px !important;
}

/* Compact timeline items - reduce spacing */
.compact-timeline-item {
  padding-bottom: 8px !important;
}

.compact-timeline-item :deep(.el-timeline-item__wrapper) {
  padding-left: 20px;
}

.compact-timeline-item :deep(.el-timeline-item__tail) {
  border-left: 2px solid #e4e7ed;
}

/* Mark link styling */
.mark-link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.mark-number {
  font-weight: 600;
  font-size: 1.1em;
  color: #409eff;
  flex-shrink: 0;
}

.dark .mark-number {
  color: #79bbff;
}

.mark-page {
  font-size: 0.9em;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.dark .mark-page {
  color: #909399;
}

/* Note display and editing */
.note-display {
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  background: #f5f7fa;
  transition: all 0.2s;
  font-size: 0.9em;
}

.dark .note-display {
  background: #2a2a2a;
}

.note-display:hover {
  background: #e4e7ed;
}

.dark .note-display:hover {
  background: #3a3a3a;
}

.note-text {
  color: #333;
}

.dark .note-text {
  color: #e5e5e5;
}

.note-placeholder {
  color: #909399;
  font-style: italic;
}

.dark .note-placeholder {
  color: #6b6b6b;
}

.note-edit-container {
  width: 100%;
}

/* Help dialog styles */
.help-content {
  line-height: 1.6;
  color: #333;
}

.dark .help-content {
  color: #e5e5e5;
}

.help-content h3 {
  font-size: 1.1em;
  font-weight: 600;
  margin-top: 16px;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.dark .help-content h3 {
  color: #fff;
}

.help-content p {
  margin-bottom: 12px;
}

.help-content ul {
  margin-left: 20px;
  margin-bottom: 12px;
}

.help-content li {
  margin-bottom: 8px;
}

.help-content code {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 0.9em;
  font-family: 'Courier New', Courier, monospace;
  color: #c7254e;
}

.dark .help-content code {
  background: #2a2a2a;
  border-color: #444;
  color: #ff7b72;
}

.help-content strong {
  font-weight: 600;
  color: #1a1a1a;
}

.dark .help-content strong {
  color: #fff;
}
</style>
