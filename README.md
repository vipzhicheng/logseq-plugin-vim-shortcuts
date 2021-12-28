# logseq-plugin-vim-shortcuts
[![Github All Releases](https://img.shields.io/github/downloads/vipzhicheng/logseq-plugin-vim-shortcuts/total.svg)](https://github.com/vipzhicheng/logseq-plugin-vim-shortcuts/releases)

This plugin provide some shortcuts which give Logseq a feeling of VIM-like.

![screencast](screencast.gif)

## Supported shortcuts

- `j`: Move to next line.
- `k`: Move to previous line.
- `h`: Outdent.
- `l`: Indent.
- `J`: Move to next sibling.
- `K`: Move to previous sibling.
- `H`: Highlight focus out to parent level.
- `L`: Highlight focus into child level.
- `i`: Enter edit mode, put the cursor to the end.
- `I`: Enter edit mode, put the cursor to the start.
- `ctrl+[`: Exit edit mode.
- `yy`: Copy current block content. Only support one block, multi blocks copy please use `cmd+c`.
- `Y`: Copy current block ref.
- `p`: Paste clipboard content to next sibling. Only support one block, multi blocks paste please use `cmd+v`.
- `P`: Paste clipboard content to previous sibling. Only support one block, multi blocks paste please use `cmd+v`.
- `o`: Insert a empty block to next sibling.
- `O`: Insert a empty block to previous sibling.
- `dd`: Delete current block, child blocks will also be deleted, but only current block content in the clipboard.
- `T`: Scroll to top, because Logseq use gg to go to graph view.
- `G`: Scroll to bottom.
- `u`: Undo.
- `ctrl+r`: Redo.
- `zo`: Extend block.
- `zm`: Collapse block.
- `/`: Trigger the search in page panel.
- `sb`: Search block content in Baidu.
- `se`: Search block content in Wikipedia.
- `sg`: Search block content in Google.
- `sh`: Search block content in Github.
- `ss`: Search block content in Stackoverflow.
- `sy`: Search block content in Youtube.

## Notice

* Logseq keybindings support may be changed in future, so just use it for a while if you need it, and it may be conflicted with Logseq future shortcuts.
* Not exactly same with VIM key-bindings, just mimic.
* If you are on journal home page, some shortcuts will redirect you to specific page, because there is no API can stay journal home page and move block highlight line.
* Some shortcuts are not perfect for now, maybe need more polish and some support from Logseq Team.
* There may be more shortcuts coming soon.
* Stay tuned.
* Copy here not means copy to system clipboard, just in memory of Logseq.
* The `VIM` scroll to top shortcut is `gg`, if you want it, you can change Logseq gg shortcut to another one, and set gg in plugin settings JSON file.
* Some shortcuts support VIM-like N+action to run action N times.
* Recommend version of Logseq is `v0.5.5`+.

## Licence

MIT
