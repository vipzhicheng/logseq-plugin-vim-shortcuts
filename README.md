# Logseq Plugin: Vim Shortcuts

[![Github All Releases](https://img.shields.io/github/downloads/vipzhicheng/logseq-plugin-vim-shortcuts/total.svg)](https://github.com/vipzhicheng/logseq-plugin-vim-shortcuts/releases)

A comprehensive Vim-style keybinding plugin for Logseq that brings powerful modal editing, navigation, and command capabilities to your note-taking workflow.

[中文文档](README_CN.md)

![screencast](screencast.gif)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Modes](#modes)
- [Settings UI](#settings-ui)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Command Mode](#command-mode)
- [Mark Feature](#mark-feature)
- [Slash Commands](#slash-commands)
- [Tips & Notes](#tips--notes)

## Features

- ✨ **Full Vim Modal Editing** - Normal, Insert, Visual (character & line), and Command modes
- 🎯 **Extensive Key Bindings** - 50+ customizable keyboard shortcuts
- ⚙️ **Visual Settings UI** - Easy configuration with graphical interface, smart defaults, and tooltips
- 🔖 **Mark System** - Save and jump to frequently used pages and blocks
- 🎨 **Block Styling** - Color picker for block backgrounds
- 🔍 **Smart Search** - In-page search with smart case matching
- 📋 **Advanced Editing** - Case conversion, number increment/decrement, replace action, and more
- 🌐 **External Search** - Quick search selection in Google, GitHub, Wikipedia, etc.

## Installation

### From Logseq Marketplace

1. Open Logseq and go to Settings → Plugins
2. Click "Marketplace"
3. Search for "Vim Shortcuts"
4. Click "Install"

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/vipzhicheng/logseq-plugin-vim-shortcuts/releases)
2. Extract to your Logseq plugins folder
3. Enable the plugin in Logseq Settings → Plugins

## Quick Start

1. **Install the plugin** from the Logseq Marketplace
2. **Restart Logseq** to activate the plugin
3. **Focus on any block** - you're now in Normal mode
4. **Try basic navigation**: `j` (down), `k` (up), `h` (left), `l` (right)
5. **Press `i` or `a`** to enter Insert mode and start editing
6. **Press `Cmd+j Cmd+j` (Mac) or `Ctrl+[ `** to exit Insert mode
7. **Open Settings**: Press `Mod+Shift+;` then type `:help` or click the gear icon ⚙️ in the command palette

## Modes

### Normal Mode

The default mode when a block is focused but not being edited. Use navigation and action commands without typing text.

**How to enter**:

- Press `Cmd+j Cmd+j` (Mac) or `Ctrl+[` while in Insert mode
- Click outside the editing area

### Insert Mode

Active editing mode where you can type and modify block content.

**How to enter**:

- Press `i` or `I` - Insert at beginning of line
- Press `a` or `A` - Insert at end of line
- Press `o` - Create new block below
- Press `O` - Create new block above

### Visual Mode

Character-level selection within a block using cursor mode.

**How to enter**:

1. First enter cursor mode by pressing `h`, `l`, `w`, `b`, `e`, or `$` in Normal mode
2. Press `v` to toggle visual selection mode

**Actions in Visual mode**:

- `h` / `l` - Extend selection left/right (character by character)
- `w` - Extend selection to next word
- `b` - Extend selection to previous word
- `e` - Extend selection to word end
- `$` - Extend selection to line end
- `gu` - Convert selection to lowercase
- `gU` - Convert selection to uppercase
- `Mod+Shift+u` - Toggle selection case
- `x` - Cut selected text
- `r` - Replace selected character(s)
- `v` - Exit visual mode

> **Note**: Visual mode operates on character-level selections within the current block, not multi-block selections. Use cursor navigation keys to extend the selection.

### Visual Line Mode

Line-level visual selection mode for selecting entire blocks.

**How to enter**: Press `Shift+V` in Normal mode

**Actions in Visual Line mode**:

- `j` / `k` - Extend selection down/up by blocks
- `J` / `K` - Move selected blocks down/up
- `gu` - Convert selected blocks to lowercase
- `gU` - Convert selected blocks to uppercase
- `Mod+Shift+u` - Toggle selected blocks case
- `x` - Cut selected blocks
- `r` - Replace first character in selected blocks
- `Shift+V` - Exit visual line mode

> **Note**: Visual Line mode selects entire blocks, making it easy to perform operations on multiple blocks at once.

### Command Mode

Execute Vim-style commands for advanced operations.

**How to enter**: Press `Mod+Shift+;` or `Mod+Alt+;` in Normal mode

**Features**:

- Auto-suggestion and Tab completion
- Command history (Up/Down arrows, 1000 commands capacity)
- 30+ available commands (see [Command Mode](#command-mode) section)

## Keyboard Shortcuts

All shortcuts can be customized via the [Settings UI](#settings-ui). Below are the default bindings organized by category.

### Navigation

| Shortcut          | Action           | Description                                                                |
| ----------------- | ---------------- | -------------------------------------------------------------------------- |
| `j`               | Move Down        | Move to next block (or extend selection down in Visual mode)               |
| `k`               | Move Up          | Move to previous block (or extend selection up in Visual mode)             |
| `h`               | Move Left        | Move cursor left within line                                               |
| `l`               | Move Right       | Move cursor right within line                                              |
| `w`               | Next Word        | Jump to start of next word                                                 |
| `b`               | Previous Word    | Jump to start of previous word                                             |
| `e`               | Word End         | Jump to end of current word                                                |
| `$`               | Line End         | Jump to end of line                                                        |
| `J`               | Next Sibling     | Jump to next sibling block (or move selected blocks down in Visual mode)   |
| `K`               | Previous Sibling | Jump to previous sibling block (or move selected blocks up in Visual mode) |
| `T`               | Jump to Top      | Scroll to top of page                                                      |
| `G`               | Jump to Bottom   | Scroll to bottom of page                                                   |
| `H`               | Focus Out        | Move focus to parent block                                                 |
| `L`               | Focus In         | Move focus to child block                                                  |
| `f<char>`         | Find Character   | Find character forward in current line                                     |
| `F<char>`         | Find Backward    | Find character backward in current line                                    |
| `;`               | Repeat Find      | Repeat last character search                                               |
| `,`               | Reverse Find     | Repeat last character search in reverse                                    |
| `Mod+Shift+Enter` | Jump Into        | Jump into page/tag reference                                               |

### Editing

| Shortcut                 | Action          | Description                                            |
| ------------------------ | --------------- | ------------------------------------------------------ |
| `i` / `I`                | Insert at Start | Enter Insert mode at line beginning                    |
| `a` / `A`                | Insert at End   | Enter Insert mode at line end                          |
| `o`                      | New Block Below | Create new block below current                         |
| `O`                      | New Block Above | Create new block above current                         |
| `Cmd+j Cmd+j` / `Ctrl+[` | Exit Editing    | Return to Normal mode                                  |
| `u`                      | Undo            | Undo last operation                                    |
| `Ctrl+r`                 | Redo            | Redo last operation                                    |
| `x`                      | Cut Character   | Cut character under cursor or visual selection         |
| `X`                      | Cut Word        | Cut word under cursor                                  |
| `r`                      | Replace         | Replace character(s) at cursor or in visual selection  |
| `Ctrl+a`                 | Increase Number | Increment first number in block                        |
| `Ctrl+x`                 | Decrease Number | Decrement first number in block                        |
| `Mod+Alt+j`              | Join Next Line  | Merge next sibling block into current                  |

### Block Operations

| Shortcut        | Action                  | Description                                |
| --------------- | ----------------------- | ------------------------------------------ |
| `dd`            | Delete Block            | Delete current block and children          |
| `dj`            | Delete Block & Next     | Delete current and next sibling blocks     |
| `dk`            | Delete Block & Previous | Delete current and previous sibling blocks |
| `dc`            | Change Block            | Delete content and enter Insert mode       |
| `yy`            | Copy Block              | Copy current block content                 |
| `Y`             | Copy Block Reference    | Copy block reference                       |
| `p`             | Paste Below             | Paste content as next sibling              |
| `P`             | Paste Above             | Paste content as previous sibling          |
| `>` / `Shift+.` | Indent                  | Increase block indentation                 |
| `<` / `Shift+,` | Outdent                 | Decrease block indentation                 |
| `zc`            | Collapse                | Collapse current block                     |
| `zo`            | Expand                  | Expand current block                       |
| `zC`            | Collapse All            | Collapse current block and all children    |
| `zO`            | Expand All              | Expand current block and all children      |

### Case Conversion

| Shortcut               | Action      | Description                                                              |
| ---------------------- | ----------- | ------------------------------------------------------------------------ |
| `Mod+Shift+u`          | Toggle Case | Toggle between upper/lower case                                          |
| `gu`                   | Lowercase   | Convert to lowercase                                                     |
| `gU`                   | Uppercase   | Convert to uppercase                                                     |
| `NUMBER`+`Mod+Shift+u` | Case Style  | Apply specific case style (1-16, see [Case Styles](#case-change-styles)) |

### Search

| Shortcut | Action                | Description                               |
| -------- | --------------------- | ----------------------------------------- |
| `/`      | Search in Page        | Open in-page search (smart case matching) |
| `n`      | Next Result           | Jump to next search result                |
| `N`      | Previous Result       | Jump to previous search result            |
| `sq`     | Clear Highlights      | Remove search highlights                  |
| `sg`     | Search Google         | Search block content in Google            |
| `sh`     | Search GitHub         | Search block content in GitHub            |
| `ss`     | Search Stack Overflow | Search block content in Stack Overflow    |
| `sb`     | Search Baidu          | Search block content in Baidu             |
| `se`     | Search Wikipedia      | Search block content in Wikipedia         |
| `sy`     | Search YouTube        | Search block content in YouTube           |

### Marks

| Shortcut              | Action                       | Description                             |
| --------------------- | ---------------------------- | --------------------------------------- |
| `<NUMBER>m`           | Save Block Mark              | Save current block as mark NUMBER       |
| `<NUMBER>M`           | Save Page Mark               | Save current page as mark NUMBER        |
| `<NUMBER>'`           | Jump to Block Mark           | Jump to block mark NUMBER in main area  |
| `<NUMBER>Shift+'`     | Jump to Page Mark            | Jump to page mark NUMBER in main area   |
| `<NUMBER>Mod+'`       | Jump to Block Mark (Sidebar) | Open block mark NUMBER in right sidebar |
| `<NUMBER>Mod+Shift+'` | Jump to Page Mark (Sidebar)  | Open page mark NUMBER in right sidebar  |

### Visual Mode & Other

| Shortcut                    | Action             | Description                            |
| --------------------------- | ------------------ | -------------------------------------- |
| `v`                         | Toggle Visual Mode | Enter/exit Visual block selection mode |
| `Shift+V`                   | Visual Line Mode   | Enter/exit Visual line selection mode  |
| `Mod+Shift+;` / `Mod+Alt+;` | Command Mode       | Open command palette                   |
| `Mod+/`                     | Emoji Picker       | Open emoji picker UI                   |

> **Note**: `Mod` = `Cmd` on macOS, `Ctrl` on Windows/Linux

> **Combo Actions**: Many shortcuts support number prefixes (e.g., `5j` moves down 5 blocks, `3dd` deletes 3 blocks)

## Settings UI

The plugin includes a modern graphical interface for customizing all key bindings without editing configuration files.

### Opening Settings

**Method 1**: Click the **gear icon (⚙)** in the command palette (between Run and Close buttons)
**Method 2**: Press `Mod+Shift+;` to open command mode, then type `:help`
**Method 3**: Bind a custom shortcut to "Open Settings" action (search for "Open Settings" in Logseq's Command Palette to configure a keybinding)

### Features

- ✅ **Visual Configuration**: View and modify all key bindings in a clean, categorized interface
- ✅ **Multiple Bindings**: Assign multiple key combinations to the same action
- ✅ **Toggle Enable/Disable**: Quickly enable or disable individual shortcuts
- ✅ **Validation**: Automatic format validation and duplicate detection
- ✅ **Smart Reset Button**: "Reset to Default" button only appears when your bindings differ from defaults
- ✅ **Default Value Tooltips**: Hover over any setting to see the default value in a tooltip
- ✅ **Smart Click-Outside Behavior**: Clicking outside the Settings UI closes it, but clicking inside Settings, Help, Marks panels, or Element Plus components keeps them open
- ✅ **Built-in Help**: Comprehensive documentation accessible via Help button

### How to Use

1. **Open Settings**: Click the gear icon (⚙) in the command palette, or use a custom keybinding if configured
2. **Browse Categories**: Navigate through Navigation, Editing, Block Operations, Search, Marks, Visual Mode, and Command categories
3. **Enable/Disable**: Use checkboxes to toggle shortcuts on/off
4. **Edit Bindings**: Click "Edit" to modify a key binding, press Enter to save, Esc to cancel
5. **Add Alternatives**: Click "+ Add Key Binding" to add additional shortcuts for the same action
6. **Remove Bindings**: Click "Remove" to delete a binding (at least one must remain)
7. **Reset to Default**: Click "Reset to Default" (only visible when different from default) to restore original settings
8. **View Defaults**: Hover over any setting to see its default value in a tooltip
9. **Save Changes**: Click "Save Settings" - Logseq will prompt to restart for changes to take effect

### Key Binding Format

Key bindings support three formats:

| Format          | Example                            | Description                       |
| --------------- | ---------------------------------- | --------------------------------- |
| **Single key**  | `j`, `k`, `h`, `l`                 | Single character keys             |
| **Combination** | `shift+j`, `ctrl+r`, `mod+shift+a` | Modifier + key                    |
| **Sequential**  | `g u`, `d d`, `z c`                | Multiple keys pressed in sequence |

**Modifier Keys**:

- `mod` - Cmd (⌘) on macOS, Ctrl on Windows/Linux
- `shift` - Shift key
- `ctrl` - Control key
- `alt` - Alt (Option on macOS) key

### Important Notes

- ⚠️ Changes require **Logseq restart** to take effect
- ⚠️ Duplicate detection prevents binding conflicts
- ⚠️ At least one binding must remain per action
- ✅ Settings persist across sessions in Logseq configuration

## Command Mode

Execute powerful Vim-style commands for advanced operations. Press `Mod+Shift+;` or `Mod+Alt+;` to activate.

### Command Palette Features

- **Auto-completion**: Type-ahead suggestions as you type
- **Tab Completion**: Press Tab when only one match exists for instant completion
- **Command History**: Navigate through last 1000 commands using Up/Down arrows
- **Keyboard Navigation**:
  - `Esc` - Close command mode and return to editing
  - `Enter` - Execute command
  - `Tab` - Auto-complete
- **UI Controls**: Run button and Close button available as alternatives

### Available Commands

#### Navigation & Jumping

| Command              | Description                     | Examples                                     |
| -------------------- | ------------------------------- | -------------------------------------------- |
| `:NUMBER`            | Scroll to line NUMBER           | `:25` - Jump to line 25                      |
| `:-NUMBER`           | Scroll to line from end         | `:-5` - Jump to 5th line from end            |
| `:.NUMBER`           | Scroll to percentage            | `:.50` - Jump to 50% of page                 |
| `:go <page>`         | Navigate to existing page/block | `:go 2022-02-22`<br>`:go ((block-uuid))`     |
| `:go! <page>`        | Navigate or create page         | `:go! ProjectIdeas` - Creates if missing     |
| `:go @index`         | Go to Contents page             | `:go @` also works                           |
| `:go @today`         | Go to today's journal           |                                              |
| `:go @yesterday`     | Go to yesterday's journal       |                                              |
| `:go @tomorrow`      | Go to tomorrow's journal        |                                              |
| `:go @prev`          | Go to previous day's journal    |                                              |
| `:go @next`          | Go to next day's journal        |                                              |
| `:go @back`          | Navigate backward in history    |                                              |
| `:go @forward`       | Navigate forward in history     |                                              |
| `:go[!] <name> --ns` | Go/create namespace page        | On page `test`: `:go! sub --ns` → `test/sub` |
| `:m <NUMBER>`        | Jump to mark NUMBER             | `:m 3` - Jump to mark 3                      |
| `:mark <NUMBER>`     | Alias for `:m`                  | `:mark 5`                                    |

#### Text Manipulation

| Command                         | Description                        | Examples                                                      |
| ------------------------------- | ---------------------------------- | ------------------------------------------------------------- |
| `:s/pattern/replacement/flags`  | Replace in current block (regex)   | `:s/foo/bar/gi` - Replace all foo with bar (case-insensitive) |
| `:%s/pattern/replacement/flags` | Replace in all page blocks (regex) | `:%s/TODO/DONE/g` - Replace all TODO with DONE                |
| `:substitute/`                  | Alias for `:s/`                    | `:substitute/old/new/`                                        |
| `:%substitute/`                 | Alias for `:%s/`                   | `:%substitute/old/new/g`                                      |

#### Marks Management

| Command               | Description           | Examples                                 |
| --------------------- | --------------------- | ---------------------------------------- |
| `:marks`              | Show all saved marks  | Display marks with notes                 |
| `:delm <NUMBERS>`     | Delete specific marks | `:delm 1 2 3` - Delete marks 1, 2, and 3 |
| `:delmarks <NUMBERS>` | Alias for `:delm`     | `:delmarks 5 6`                          |
| `:delm!`              | Delete all marks      | Clears all saved marks                   |
| `:delmarks!`          | Alias for `:delm!`    |                                          |

#### Page Management

| Command             | Description                 | Examples                                    |
| ------------------- | --------------------------- | ------------------------------------------- |
| `:re <newname>`     | Rename current page         | `:re NewPageName` - Merges if target exists |
| `:rename <newname>` | Alias for `:re`             | `:rename ProjectNotes`                      |
| `:copy-path`        | Copy page/journal file path | For external editing                        |
| `:open-in-vscode`   | Open current page in VSCode | Requires VSCode installed                   |

#### Content Generation

| Command                    | Description                        | Examples                                          |
| -------------------------- | ---------------------------------- | ------------------------------------------------- |
| `:lorem`                   | Generate random lorem ipsum blocks | `:lorem` - Default paragraphs                     |
| `:lorem-ipsum`             | Alias for `:lorem`                 |                                                   |
| `:lorem -u w`              | Generate random words              | Unit: `w`/`word`, `s`/`sentence`, `p`/`paragraph` |
| `:lorem --unit sentence`   | Long form unit specification       | `:lorem --unit paragraph`                         |
| `:emoji <keyword>`         | Insert emoji by keyword search     | `:emoji smile`                                    |
| `:emoji <keyword> <count>` | Insert multiple emojis             | `:emoji heart 5` - Insert 5 hearts                |
| `:emoji-picker`            | Open emoji picker UI               | Visual emoji selection                            |

#### Block Styling

| Command       | Description                 | Examples                   |
| ------------- | --------------------------- | -------------------------- |
| `:bg <color>` | Set block background color  | `:bg red` or `:bg #ff0000` |
| `:bg-picker`  | Open color picker UI        | Visual color selection     |
| `:bg-random`  | Set random background color | Random color assignment    |
| `:bg-clear`   | Remove background color     | Clear block styling        |

**Color Formats**: Named colors (e.g., `red`, `blue`) from [CSS color values](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) or hex codes (e.g., `#ff0000`)

> Note: Block styling commands support multiple block selection in Visual mode

#### Sorting

| Command  | Description                      |
| -------- | -------------------------------- |
| `:sort`  | Sort blocks alphabetically (A-Z) |
| `:rsort` | Reverse sort blocks (Z-A)        |

- **No block focused**: Sorts page's top-level blocks
- **Block focused**: Sorts that block's children

#### Editing

| Command | Description           |
| ------- | --------------------- |
| `:undo` | Undo last edit        |
| `:redo` | Redo last undone edit |

#### System

| Command         | Description                             |
| --------------- | --------------------------------------- |
| `:w` / `:write` | Save page (symbolic, Logseq auto-saves) |
| `:wq`           | Save and quit command mode              |
| `:q` / `:quit`  | Quit command mode                       |
| `:h` / `:help`  | Show help documentation                 |

## Case Change Styles

Use `NUMBER` + `Mod+Shift+u` to apply different case transformations:

| Number | Style                 | Example Output                  |
| ------ | --------------------- | ------------------------------- |
| `1`    | Toggle Case (default) | Toggles between UPPER and lower |
| `2`    | UPPERCASE             | `LOGSEQ IS SO AWESOME`          |
| `3`    | lowercase             | `logseq is so awesome`          |
| `4`    | Title Case            | `Logseq Is So Awesome`          |
| `5`    | Sentence case         | `Logseq is so awesome`          |
| `6`    | path/case             | `logseq/is/so/awesome`          |
| `7`    | Capital Case          | `Logseq Is So Awesome`          |
| `8`    | CONSTANT_CASE         | `LOGSEQ_IS_SO_AWESOME`          |
| `9`    | dot.case              | `logseq.is.so.awesome`          |
| `10`   | Header-Case           | `Logseq-Is-So-Awesome`          |
| `11`   | param-case            | `logseq-is-so-awesome`          |
| `12`   | PascalCase            | `LogseqIsSoAwesome`             |
| `13`   | camelCase             | `logseqIsSoAwesome`             |
| `14`   | snake_case            | `logseq_is_so_awesome`          |
| `15`   | sWAP cASE             | `lOGSEQ IS SO AWESOME`          |
| `16`   | RaNdOm CaSe           | `logsEQ IS SO awESoME`          |

**Usage**: Press the number first, then `Mod+Shift+u`. Example: `2` then `Mod+Shift+u` converts to UPPERCASE.

## Mark Feature

The mark system lets you bookmark and quickly jump to frequently used pages and blocks - like browser bookmarks for your knowledge graph.

### Features

- 🔖 **Persistent Storage**: Marks are saved automatically per graph
- 📄 **Dual Types**: Save both block-level and page-level marks
- 🔢 **Unlimited Marks**: Use any number (not limited to 0-9)
- 📝 **Auto Notes**: Block marks show content preview, page marks show page name
- 🎯 **Multiple Jump Modes**: Open in main area or right sidebar

### Usage

1. **Save a Mark**:

   - Block mark: Press `m` then a number (e.g., `m5` saves to mark 5)
   - Page mark: Press `M` then a number (e.g., `M3` saves page to mark 3)

2. **Jump to Mark**:

   - Main area: Press `'` then number (e.g., `'5` jumps to mark 5)
   - Right sidebar: Press `Mod+'` then number (e.g., `Mod+'5` opens mark 5 in sidebar)

3. **View All Marks**: Type `:marks` in command mode

4. **Delete Marks**:
   - Specific marks: `:delm 1 2 3`
   - All marks: `:delm!`

### Comparison

| Feature                   | Marks | Favorites | Recent | Tabs Plugin |
| ------------------------- | ----- | --------- | ------ | ----------- |
| Custom organization       | ✅    | ✅        | ❌     | ✅          |
| Number-based quick access | ✅    | ❌        | ❌     | ❌          |
| Block-level bookmarks     | ✅    | ❌        | ❌     | ❌          |
| Keyboard-only workflow    | ✅    | ❌        | ❌     | ⚠️          |

> **Note**: The `m` shortcut may conflict with the Markmap plugin. If you experience issues, update Markmap to the latest version or remap the mark shortcut in Settings.

## Slash Commands

The plugin adds Vim-related operations to Logseq's slash command menu:

| Slash Command               | Description                                        |
| --------------------------- | -------------------------------------------------- |
| `/Insert Emoji`             | Insert emoji at cursor position                    |
| `/Sort Blocks`              | Sort child blocks alphabetically (A-Z)             |
| `/Reverse Sort Blocks`      | Sort child blocks reverse alphabetically (Z-A)     |
| `/Random Bg Color`          | Apply random background color to current block     |
| `/Children Random Bg Color` | Apply random background colors to all child blocks |

## Tips & Notes

### General

- **Not Pure Vim**: This plugin mimics Vim behavior but isn't a complete Vim implementation
- **Clipboard Scope**: Copy/paste operations (`yy`, `p`) use Logseq's internal clipboard, not system clipboard. For system clipboard, use `Cmd+C`/`Cmd+V`
- **Auto-save**: The `:w` (write) command is symbolic - Logseq auto-saves all changes
- **Number Prefixes**: Many commands support repetition - e.g., `5j` moves down 5 blocks, `3dd` deletes 3 blocks

### Smart Search

Press `/` to trigger in-page search with smart case matching:

- **Lowercase query**: Case-insensitive search (e.g., `vim` matches "Vim", "VIM", "vim")
- **Mixed case query**: Case-sensitive search (e.g., `Vim` only matches "Vim")

### Key Binding Notes

- **Customization**: All key bindings can be customized via Settings UI
- **Multiple Bindings**: Actions can have multiple key combinations
- **Potential Conflicts**: Some shortcuts may conflict with future Logseq updates or other plugins
- **Platform Differences**: `Mod` = `Cmd` on macOS, `Ctrl` on Windows/Linux

### Limitations

- **Journal Home**: Some shortcuts redirect to a specific page when on journal home due to API limitations
- **Join Blocks**: The join command only works on sibling blocks without children; avoid rapid triggering in edit mode
- **Scroll to Top**: Vim's `gg` is used by Logseq for graph view. Use `T` (Shift+t) instead, or remap Logseq's `gg` and configure this plugin to use it

### Combo Actions

Prefix actions with numbers for repetition:

- `5j` - Move down 5 blocks
- `3dd` - Delete 3 blocks
- `10k` - Move up 10 blocks
- `2o` - Create 2 new blocks below

### Jump Into Pages

When cursor is on a page reference `[[Page Name]]` or tag `#tag`:

- Press `Mod+Shift+Enter` to jump into that page
- With number prefix: `2 Mod+Shift+Enter` jumps to the 2nd page link if multiple exist

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests on [GitHub](https://github.com/vipzhicheng/logseq-plugin-vim-shortcuts).

## Support the Project

If this plugin has improved your Logseq workflow, consider supporting development:

- ☕ [Buy Me a Coffee](https://www.buymeacoffee.com/vipzhicheng)
- 🎁 [爱发电 (Afdian - for Chinese users)](https://afdian.com/a/vipzhicheng)

Your support helps maintain and improve this plugin!

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Vim's modal editing paradigm
- Built for the amazing [Logseq](https://logseq.com/) community
- Thanks to all contributors and users for feedback and support

---

**Made with ❤️ for Vim and Logseq enthusiasts**
