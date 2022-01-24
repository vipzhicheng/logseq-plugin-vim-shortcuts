# CHANGELOG

## v0.0.3

* fix: `mod+j mod+j` would conflict with `ctrl+j` on many devices, so I changed `ctrl+j` shortcut to `mod+alt+j` to join sibling block.
* feat: add `ctrl+[` to also trigger exiting editing mode, but still have `mod+j mod+j`.
* feat: add `a` to enter insert mode, but still have `i` do the same thing.

## v0.0.2

* feat: add `mod+j mod+j` to exit editing mode.
* feat: add `ctrl+enter` to jump into internal page, support `[[]]` and `#tag` style, sometimes better UX than DWIM.
* feat: add `ctrl+j` to join next sibling conditionally.
* fix: `z o` and `z m` shortcut not work on latest Logseq release.

NOTE:
1. The joining shortcut can only join siblings without children blocks and support combo and should not be trigger too fast in editing mode.
2. Jumping internal page support combo to select which page to jump.
