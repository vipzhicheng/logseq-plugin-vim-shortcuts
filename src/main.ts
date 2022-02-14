import '@logseq/libs';
import { getNumber, initSettings, resetNumber } from './common/funcs';
import bottom from './keybindings/bottom';
import changeCase from './keybindings/changeCase';
import changeCaseLowerCase from './keybindings/changeCaseLowerCase';
import changeCaseUpperCase from './keybindings/changeCaseUpperCase';
import collapse from './keybindings/collapse';
import collapseAll from './keybindings/collapseAll';
import copyCurrentBlockContent from './keybindings/copyCurrentBlockContent';
import copyCurrentBlockRef from './keybindings/copyCurrentBlockRef';
import deleteCurrentBlock from './keybindings/deleteCurrentBlock';
import down from './keybindings/down';
import exitEditing from './keybindings/exitEditing';
import extend from './keybindings/extend';
import extendAll from './keybindings/extendAll';
import highlightFocusIn from './keybindings/highlightFocusIn';
import highlightFocusOut from './keybindings/highlightFocusOut';
import indent from './keybindings/indent';
import insert from './keybindings/insert';
import insertBefore from './keybindings/insertBefore';
import joinNextLine from './keybindings/joinNextLine';
import jumpInto from './keybindings/jumpInto';
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
import toggleVisualMode from './keybindings/toggleVisualMode';
import top from './keybindings/top';
import undo from './keybindings/undo';
import up from './keybindings/up';

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

  // collapseAll(logseq);
  // extendAll(logseq);

  highlightFocusIn(logseq);
  highlightFocusOut(logseq);

  searchBaidu(logseq);
  searchGithub(logseq);
  searchGoogle(logseq);
  searchStackoverflow(logseq);
  searchWikipedia(logseq);
  searchYoutube(logseq);

  exitEditing(logseq);
  jumpInto(logseq);
  joinNextLine(logseq);

  toggleVisualMode(logseq);

  changeCase(logseq);
  changeCaseUpperCase(logseq);
  changeCaseLowerCase(logseq);

}

logseq.ready(main).catch(console.error);
