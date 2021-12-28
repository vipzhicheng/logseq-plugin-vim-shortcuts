import '@logseq/libs';
import { initSettings } from './common/funcs';
import bottom from './keybindings/bottom';
import collapse from './keybindings/collapse';
import copyCurrentBlockContent from './keybindings/copyCurrentBlockContent';
import copyCurrentBlockRef from './keybindings/copyCurrentBlockRef';
import deleteCurrentBlock from './keybindings/deleteCurrentBlock';
import down from './keybindings/down';
import extend from './keybindings/extend';
import highlightFocusIn from './keybindings/highlightFocusIn';
import highlightFocusOut from './keybindings/highlightFocusOut';
import indent from './keybindings/indent';
import insert from './keybindings/insert';
import insertBefore from './keybindings/insertBefore';
import nextNewBlock from './keybindings/nextNewBlock';
import nextSibling from './keybindings/nextSibling';
import number from './keybindings/number';
import outdent from './keybindings/outdent';
import pasteNext from './keybindings/pasteNext';
import pastePrev from './keybindings/pastePrev';
import prevNewBlock from './keybindings/prevNewBlock';
import prevSibling from './keybindings/prevSibling';
import redo from './keybindings/redo';
import search from './keybindings/search';
import searchBaidu from './keybindings/searchBaidu';
import searchGithub from './keybindings/searchGithub';
import searchGoogle from './keybindings/searchGoogle';
import searchStackoverflow from './keybindings/searchStackoverflow';
import searchWikipedia from './keybindings/searchWikipedia';
import searchYoutube from './keybindings/searchYoutube';
import top from './keybindings/top';
import undo from './keybindings/undo';
import up from './keybindings/up';
import exit from './keybindings/exit';





async function main() {

  // settings
  initSettings();

  // bindings

  number(logseq);

  undo(logseq);
  redo(logseq);

  search(logseq);

  insert(logseq);
  insertBefore(logseq);

  exit(logseq);

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
