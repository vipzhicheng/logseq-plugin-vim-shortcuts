
export type TempCache = {
  clipboard: string
  lastPage: string
};

export type N = {
  n: number
  lastChange: Date | null
};

// Key binding metadata for settings UI
export interface KeyBindingMeta {
  key: string;
  label: string;
  description: string;
  category: string;
  defaultBinding: string | string[];
}

export type KeyBindingCategory =
  | 'navigation'
  | 'editing'
  | 'block'
  | 'search'
  | 'mark'
  | 'command'
  | 'visual';

// Key bindings metadata
export const keyBindingsMeta: KeyBindingMeta[] = [
  // Navigation
  { key: 'down', label: 'Move Down', description: 'Move cursor down to next block', category: 'navigation', defaultBinding: 'j' },
  { key: 'up', label: 'Move Up', description: 'Move cursor up to previous block', category: 'navigation', defaultBinding: 'k' },
  { key: 'left', label: 'Move Left', description: 'Move cursor left', category: 'navigation', defaultBinding: 'h' },
  { key: 'right', label: 'Move Right', description: 'Move cursor right', category: 'navigation', defaultBinding: 'l' },
  { key: 'wordForward', label: 'Next Word', description: 'Move to start of next word', category: 'navigation', defaultBinding: 'w' },
  { key: 'wordBackward', label: 'Previous Word', description: 'Move to start of previous word', category: 'navigation', defaultBinding: 'b' },
  { key: 'wordEnd', label: 'Word End', description: 'Move to end of word', category: 'navigation', defaultBinding: 'e' },
  { key: 'lineEnd', label: 'Line End', description: 'Move to end of line', category: 'navigation', defaultBinding: 'shift+4' },
  { key: 'nextSibling', label: 'Next Sibling', description: 'Jump to next sibling block', category: 'navigation', defaultBinding: 'shift+j' },
  { key: 'prevSibling', label: 'Previous Sibling', description: 'Jump to previous sibling block', category: 'navigation', defaultBinding: 'shift+k' },
  { key: 'top', label: 'Jump to Top', description: 'Jump to top of page', category: 'navigation', defaultBinding: 'shift+t' },
  { key: 'bottom', label: 'Jump to Bottom', description: 'Jump to bottom of page', category: 'navigation', defaultBinding: 'shift+g' },
  { key: 'findChar', label: 'Find Character', description: 'Find character forward in current line', category: 'navigation', defaultBinding: 'f' },
  { key: 'findCharBackward', label: 'Find Character Backward', description: 'Find character backward in current line', category: 'navigation', defaultBinding: 'shift+f' },
  { key: 'repeatCharSearch', label: 'Repeat Character Search', description: 'Repeat last character search', category: 'navigation', defaultBinding: ';' },
  { key: 'repeatCharSearchReverse', label: 'Repeat Character Search Reverse', description: 'Repeat last character search in reverse', category: 'navigation', defaultBinding: ',' },
  { key: 'jumpInto', label: 'Jump Into Block', description: 'Jump into current block content', category: 'navigation', defaultBinding: 'mod+shift+enter' },

  // Editing
  { key: 'insert', label: 'Insert at End', description: 'Enter insert mode at end of line', category: 'editing', defaultBinding: ['shift+a', 'a'] },
  { key: 'insertBefore', label: 'Insert at Start', description: 'Enter insert mode at start of line', category: 'editing', defaultBinding: ['shift+i', 'i'] },
  { key: 'nextNewBlock', label: 'New Block Below', description: 'Create new block below', category: 'editing', defaultBinding: 'o' },
  { key: 'prevNewBlock', label: 'New Block Above', description: 'Create new block above', category: 'editing', defaultBinding: 'shift+o' },
  { key: 'undo', label: 'Undo', description: 'Undo last operation', category: 'editing', defaultBinding: 'u' },
  { key: 'redo', label: 'Redo', description: 'Redo last operation', category: 'editing', defaultBinding: 'ctrl+r' },
  { key: 'exitEditing', label: 'Exit Editing', description: 'Exit editing mode', category: 'editing', defaultBinding: ['mod+j mod+j', 'ctrl+['] },
  { key: 'changeCase', label: 'Toggle Case', description: 'Toggle case of current character', category: 'editing', defaultBinding: 'mod+shift+u' },
  { key: 'changeCaseUpper', label: 'To Uppercase', description: 'Convert selected text to uppercase', category: 'editing', defaultBinding: 'g shift+u' },
  { key: 'changeCaseLower', label: 'To Lowercase', description: 'Convert selected text to lowercase', category: 'editing', defaultBinding: 'g u' },
  { key: 'increase', label: 'Increase Number', description: 'Increase number at cursor by 1', category: 'editing', defaultBinding: 'ctrl+a' },
  { key: 'decrease', label: 'Decrease Number', description: 'Decrease number at cursor by 1', category: 'editing', defaultBinding: 'ctrl+x' },
  { key: 'joinNextLine', label: 'Join Next Line', description: 'Join next line to current line', category: 'editing', defaultBinding: 'mod+alt+j' },

  // Block Operations
  { key: 'deleteCurrentBlock', label: 'Delete Block', description: 'Delete current block', category: 'block', defaultBinding: 'd d' },
  { key: 'deleteCurrentAndNextSiblingBlocks', label: 'Delete Block and Next', description: 'Delete current and next sibling block', category: 'block', defaultBinding: 'd j' },
  { key: 'deleteCurrentAndPrevSiblingBlocks', label: 'Delete Block and Previous', description: 'Delete current and previous sibling block', category: 'block', defaultBinding: 'd k' },
  { key: 'changeCurrentBlock', label: 'Change Block', description: 'Delete block content and enter edit mode', category: 'block', defaultBinding: 'd c' },
  { key: 'copyCurrentBlockContent', label: 'Copy Block Content', description: 'Copy current block content', category: 'block', defaultBinding: 'y y' },
  { key: 'copyCurrentBlockRef', label: 'Copy Block Reference', description: 'Copy current block reference', category: 'block', defaultBinding: 'shift+y' },
  { key: 'pasteNext', label: 'Paste Below', description: 'Paste below current block', category: 'block', defaultBinding: 'p' },
  { key: 'pastePrev', label: 'Paste Above', description: 'Paste above current block', category: 'block', defaultBinding: 'shift+p' },
  { key: 'cut', label: 'Cut Character', description: 'Cut character at cursor', category: 'block', defaultBinding: 'x' },
  { key: 'cutWord', label: 'Cut Word', description: 'Cut word at cursor', category: 'block', defaultBinding: 'shift+x' },
  { key: 'indent', label: 'Indent', description: 'Increase block indentation', category: 'block', defaultBinding: ['shift+.'] },
  { key: 'outdent', label: 'Outdent', description: 'Decrease block indentation', category: 'block', defaultBinding: ['shift+,'] },
  { key: 'collapse', label: 'Collapse', description: 'Collapse current block', category: 'block', defaultBinding: 'z c' },
  { key: 'collapseAll', label: 'Collapse All', description: 'Collapse all blocks', category: 'block', defaultBinding: 'z shift+c' },
  { key: 'extend', label: 'Expand', description: 'Expand current block', category: 'block', defaultBinding: 'z o' },
  { key: 'extendAll', label: 'Expand All', description: 'Expand all blocks', category: 'block', defaultBinding: 'z shift+o' },
  { key: 'highlightFocusIn', label: 'Focus In', description: 'Highlight and focus into current block', category: 'block', defaultBinding: 'shift+l' },
  { key: 'highlightFocusOut', label: 'Focus Out', description: 'Remove highlight and focus out of block', category: 'block', defaultBinding: 'shift+h' },

  // Search
  { key: 'search', label: 'Search', description: 'Open search panel', category: 'search', defaultBinding: '/' },
  { key: 'searchNext', label: 'Next Search Result', description: 'Jump to next search result', category: 'search', defaultBinding: 'n' },
  { key: 'searchPrev', label: 'Previous Search Result', description: 'Jump to previous search result', category: 'search', defaultBinding: 'shift+n' },
  { key: 'searchCleanup', label: 'Clear Search Highlights', description: 'Clear search result highlights', category: 'search', defaultBinding: 's q' },
  { key: 'searchBaidu', label: 'Search Baidu', description: 'Search selected text on Baidu', category: 'search', defaultBinding: 's b' },
  { key: 'searchGithub', label: 'Search GitHub', description: 'Search selected text on GitHub', category: 'search', defaultBinding: 's h' },
  { key: 'searchGoogle', label: 'Search Google', description: 'Search selected text on Google', category: 'search', defaultBinding: 's g' },
  { key: 'searchStackoverflow', label: 'Search StackOverflow', description: 'Search selected text on StackOverflow', category: 'search', defaultBinding: 's s' },
  { key: 'searchWikipedia', label: 'Search Wikipedia', description: 'Search selected text on Wikipedia', category: 'search', defaultBinding: 's e' },
  { key: 'searchYoutube', label: 'Search YouTube', description: 'Search selected text on YouTube', category: 'search', defaultBinding: 's y' },

  // Mark
  { key: 'markSave', label: 'Save Mark', description: 'Save current position as mark', category: 'mark', defaultBinding: 'm' },
  { key: 'markPageSave', label: 'Save Page Mark', description: 'Save current page as mark', category: 'mark', defaultBinding: 'shift+m' },
  { key: 'markJump', label: 'Jump to Mark', description: 'Jump to specified mark', category: 'mark', defaultBinding: "'" },
  { key: 'markPageJump', label: 'Jump to Page Mark', description: 'Jump to specified page mark', category: 'mark', defaultBinding: "shift+'" },
  { key: 'markJumpSidebar', label: 'Open Mark in Sidebar', description: 'Open specified mark in sidebar', category: 'mark', defaultBinding: "mod+'" },
  { key: 'markPageJumpSidebar', label: 'Open Page Mark in Sidebar', description: 'Open specified page mark in sidebar', category: 'mark', defaultBinding: "mod+shift+'" },

  // Visual Mode
  { key: 'toggleVisualMode', label: 'Toggle Visual Mode', description: 'Toggle visual mode to select text', category: 'visual', defaultBinding: 'v' },

  // Command
  { key: 'command', label: 'Command Palette', description: 'Open command palette', category: 'command', defaultBinding: ['mod+alt+;', 'mod+shift+;'] },
  { key: 'emoji', label: 'Emoji Picker', description: 'Open emoji picker', category: 'command', defaultBinding: 'mod+/' },
];

export const categoryLabels: Record<KeyBindingCategory, string> = {
  navigation: 'Navigation',
  editing: 'Editing',
  block: 'Block Operations',
  search: 'Search',
  mark: 'Marks',
  visual: 'Visual Mode',
  command: 'Command',
};
