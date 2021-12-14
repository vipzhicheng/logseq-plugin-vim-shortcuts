import '@logseq/libs';
import { BlockEntity } from '@logseq/libs/dist/LSPlugin';

import undo from './keybindings/undo';
import redo from './keybindings/redo';
import insert from './keybindings/insert';
import bottom from './keybindings/bottom';
import top from './keybindings/top';
import nextSibling from './keybindings/nextSibling';
import prevSibling from './keybindings/prevSibling';
import nextNewBlock from './keybindings/nextNewBlock';
import prevNewBlock from './keybindings/prevNewBlock';
import deleteCurrentBlock from './keybindings/deleteCurrentBlock';
import copyCurrentBlockContent from './keybindings/copyCurrentBlockContent';
import copyCurrentBlockRef from './keybindings/copyCurrentBlockRef';
import pasteNext from './keybindings/pasteNext';
import pastePrev from './keybindings/pastePrev';
import collapse from './keybindings/collapse';
import extend from './keybindings/extend';
import highlightFocusIn from './keybindings/highlightFocusIn';
import highlightFocusOut from './keybindings/highlightFocusOut';
import search from './keybindings/search';
import insertBefore from './keybindings/insertBefore';

async function main() {
  undo(logseq);
  redo(logseq);
  search(logseq);
  insert(logseq);
  insertBefore(logseq);
  top(logseq);
  bottom(logseq);
  nextSibling(logseq);
  prevSibling(logseq);
  nextNewBlock(logseq);
  prevNewBlock(logseq);
  deleteCurrentBlock(logseq);
  copyCurrentBlockContent(logseq);
  copyCurrentBlockRef(logseq);
  pasteNext(logseq);
  pastePrev(logseq);
  collapse(logseq);
  extend(logseq);
  highlightFocusIn(logseq);
  highlightFocusOut(logseq);

}

logseq.ready(main).catch(console.error);
