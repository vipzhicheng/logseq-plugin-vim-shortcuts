# CHANGELOG

## v0.1.1

- feat: add `@back` and `@forward` for command mode `:go` command.
- feat: add `:lorem` command to generate some random blocks.

## v0.1.0

- feat: add VIM command mode, trigger by shortcut: `mod+shift+;`，for now 10+ commands supported, and I'm sure that would be more.
- feat: one useful commmand is: replace string like VIM. Input `:%s/search/replace/modifiers`, e.g. `:%s/foo/bar/ig`
- feat: another useful command is: go to page. Input `:go PAGENAME`, e.g. `:go 2022-02-22`, also support go to block by `:go ((blockId))`
- feat: some commands related to marks: `:marks`, `:delmarks`, `:delmarks!`, `:mark`.
- more commands descriptions in README.

## v0.0.8

- fix: `ctrl+v` in Windows is for pasting, so I disable visual block mode key-binding for editing mode.
- feat: add mark feature like VIM, the short cut is `NUMBER + m` to save current page or block, and `NUMBER + '` to load saved mark, and `mod+'` to load saved mark on right sidebar. The NUMBER can be more than 10, actually thousands if you wish.
- infra: build tool changed from Webpack to Vite.
- infra: use Github Actions to publish plugin.

## v0.0.7

- feat: add changing case action, the shortcut is `mod+shift+u`, means to toggle upper case and lower case.
- feat: combo action supported 16 case style, `Number key` + `mod+shift+u` to trigger, learn more from README.
- feat: add original VIM case shortcut, `gu` is for lower case, `gU` is for upper case.

## v0.0.6

- feat: add VIM-like visual block mode, in this mode, `j` and `k` are for block selecting, `J` and `K` are for block moving.

## v0.0.5

- all actions support multiple key bindings in settings JSON file.

## v0.0.4

- fix: change `ctrl+enter` to `mod+shift+enter` to jump internal page or tag.

## v0.0.3

- fix: `mod+j mod+j` would conflict with `ctrl+j` on many devices, so I changed `ctrl+j` shortcut to `mod+alt+j` to join sibling block.
- feat: add `ctrl+[` to also trigger exiting editing mode, but still have `mod+j mod+j`.
- feat: add `a` to enter insert mode, but still have `i` do the same thing.

## v0.0.2

- feat: add `mod+j mod+j` to exit editing mode.
- feat: add `ctrl+enter` to jump into internal page, support `[[]]` and `#tag` style, sometimes better UX than DWIM.
- feat: add `ctrl+j` to join next sibling conditionally.
- fix: `zo` and `zm` shortcut not work on latest Logseq release.

NOTE:

1. The joining shortcut can only join siblings without children blocks and support combo and should not be trigger too fast in editing mode.
2. Jumping internal page support combo to select which page to jump.
