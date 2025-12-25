# CHANGELOG

## v0.2.0

- fix: add `shift+.` and `shift+,` to indent and outdent block, thanks to @primeapple for the suggestion. #34
- fix: use `shift+h` and `shift+l` to focus in and out block level.
- fix: adjust showMsg to use logseq.UI.showMsg instead of logseq.App.showMsg
- feat: search highlight can match word multi times in block
- feat: search highlight can use a/A/i/I/d c to edit like VIM
- fix: adjust some key bindings.
- feat: big feature, add cursor to block in normal mode.
- fix: optimize j and k to move across block levels.
- feat: add visual mode to select text in block.
- feat: improve marks UI and functionality.
- chore: upgrade deps.

## v0.1.24

- chore: adjust github action config file

## v0.1.23

- merge #65 and #66, thanks to @primeapple
- fix: optimize vim command substitute

## v0.1.22

- fix: hide Visual/Normal indicator by setting

## v0.1.21

- fix: try to stay in the original page.

## v0.1.20

- fix: jump into tag scenario
- infra: upgrade deps

## v0.1.19

- fix: optimize prevSibling and nextSibling action. It can keep on block page now.

## v0.1.18

- feat: add delete prev and next blocks keybindings. #39
- feat: add an option to show recent emoji by default. By the way, the default shortcut is `cmd+/` for triiger the emoji panel. #35
- fix: jump into can not recognize tag correctly. #42
- fix: try to fix go sibling commands not work in zoom edit mode. #41

## v0.1.17

- fix: highlight focus in not work
- adjust: replace `hl` and `HL`

## v0.1.16

- fix typo #26

## v0.1.15

- feat: add visual mode indicator
- fix: highlight search collapsed content

## v0.1.14

- fix: search highlight issues

## v0.1.13

- fix: search highlight case

## v0.1.12

- feat: refactor search highlight, now it won't change block content.

## v0.1.11

- fix: change mapping `zm` and `zM` to `zc` and `zC`. #21
- fix: adjust `a`, `i`, `A` and `I` mapping #20.
- fix: typos, thanks to @RomanHN
- fix: adjust color picker, auto lose focus for preview

## v0.1.10

- feat: support `:NUMBER` to scroll to specific line or `:.NUMBER` represents scrolling to NUMBER \* 100% of the page.
- fix: optimize search a little bit.

## v0.1.9

- feat: add `--ns` and `--namespace` to `:go` and `:go!`, so you can go next level without inputing prefix title

## v0.1.8

- feat: add `z M` to collapse hierarchically. add `z O` to extend hierarchically.

## v0.1.7

- feat: new VIM-like in-page search support smartcase.
- feat: add short n for next match, N for prev match.
- feat: add highlight support, `:clear-highlights` to clear all highlights on current page.

## v0.1.6

- feat: add `ctrl+a` and `ctrl+x` to increase or decrease the first found number in block. Support multiple selections and combo.
- feat: add `x` and `X` to cut a leading character or word. Support multiple selections.
- adjust: `:lorem` now support `-p` and `--paragraph` stands for `paragraph`, `-w` and `--word` stands for word.
- adjust: `:lorem-ipsum` is deleted, because it is too long to type.

## v0.1.5

- feat: add `:copy-path` to get page or journal absolute path, so you can edit it outside of Logseq.
- feat: add `:open-in-vscode` to open page or journal in VSCode

## v0.1.4

This release is all about setting block background color

- feat: `:bg [namedColor|hexColor]` command to set block background color, support multiple block selection.
- feat: `:bg-picker` command to trigger a color picker to select block background color, support multiple block selection.
- feat: `:bg-random` command to set block background color randomly, support multiple block selection.
- feat: `:bg-clear` command to clear block background color, support multiple block selection.
- feat: `/Random Bg Color` and `Children Random Bg Color` to set block background color and children blocks background color.

## v0.1.3

- feat: add `mod+alt+;` shortcut to command mode for Windows trigger.
- feat: support emoji replacement, like `:smile:` will be replaced to 😄 immediately.

## v0.1.2

- feat: add `:sort` and `:rsort` to sort blocks, it support to sort/reverse sort page first level blocks with no focus any blocks and to sort/reverse sort sub level blocks with focus on one block.
- feat: also you can sort sub level blocks or reverse sort by slash command: `/Sort Blocks` and `/Reverse Sort Blocks`.
- fix: change emoji-picker ui shortcut from `ctrl+e` to `mod+/` because `ctrl+e` in editing mode have special meaning.
- fix: remove `trigger-on-focus` option commands.

## v0.1.1

- feat: add `@back` and `@forward` for command mode `:go` command.
- feat: add `:lorem` command to generate some random blocks.
- feat: add `:emoji` to insert emojis by searching keyword.
- feat: add `:emoji-picker` to open emoji picker UI.
- feat: add `ctrl+e` to trigger emoji picker UI.
- feat: add `/Insert emoji` slash command to trigger emoji picker UI.

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
