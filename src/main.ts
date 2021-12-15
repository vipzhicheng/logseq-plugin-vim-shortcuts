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
import up from './keybindings/up';
import down from './keybindings/down';
import outdent from './keybindings/outdent';
import indent from './keybindings/indent';
import searchBaidu from './keybindings/searchBaidu';
import searchGithub from './keybindings/searchGithub';
import searchGoogle from './keybindings/searchGoogle';
import searchStackoverflow from './keybindings/searchStackoverflow';
import searchWikipedia from './keybindings/searchWikipedia';
import searchYoutube from './keybindings/searchYoutube';

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

  up(logseq);
  down(logseq);

  indent(logseq);
  outdent(logseq);

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

  searchBaidu(logseq);
  searchGithub(logseq);
  searchGoogle(logseq);
  searchStackoverflow(logseq);
  searchWikipedia(logseq);
  searchYoutube(logseq);

}

logseq.ready(main).catch(console.error);
