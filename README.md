# logseq-plugin-vim-shortcuts

This plugin provide some shortcuts which give Logseq a feeling of VIM-like.

## Supported shortcuts

- `j`: Move to next sibling.
- `k`: Move to previous sibling.
- `h`: Collapse current block.
- `l`: Extend current block.
- `J`: Move to next line.
- `K`: Move to previous line.
- `H`: Highlight Focus out.
- `L`: Highlight Focus in.
- `i`: Enter edit mode, put the cursor to the end.
- `I`: Enter edit mode, put the cursor to the start. TODO:
- `yy`: Copy current block content. Only support one block, multi blocks copy please use `cmd+c`.
- `Y`: Copy current block ref.
- `p`: Paste clipboard content to next sibling. Only support one block, multi blocks paste please use `cmd+v`.
- `P`: Paste clipboard content to previous sibling. Only support one block, multi blocks paste please use `cmd+v`.
- `o`: Insert a empty block to next sibling.
- `O`: Insert a empty block to previous sibling.
- `dd`: Delete current block.
- `T`: Scroll to top, because Logseq use gg to go to graph view, you can change that shortcut to another shortcut first and then set gg back to this Command on this plugin's settings panel(WIP).
- `G`: Scroll to bottom.
- `u`: Undo.
- `ctrl+r`: Redo.
- `/`: Trigger the search panel.

## Notice

* Logseq keybindings support may be changed in future, so just use it for a while if you need it.
* Not exactly same with VIM key-bindings, just mimic.
* If you are on journal home page, some shortcuts will redirect you to specific page, because there is no API can stay journal home page and move block highlight line.
* Some shortcuts are not perfect for now, maybe need more polish and some support from Logseq Team.
* There may be more shortcuts coming soon.
* Stay tuned.
* Copy here not means copy to system clipboard, just in memory of Logseq.

## Licence

MIT
