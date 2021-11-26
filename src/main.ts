import '@logseq/libs';
import { BlockEntity } from '@logseq/libs/dist/LSPlugin';


import insert from './keybindings/insert';
import bottom from './keybindings/bottom';
import top from './keybindings/top';

async function main() {
  let block : BlockEntity | null = await logseq.Editor.getCurrentBlock();
  insert(logseq, block);
  // bottom(logseq, block);
  // top(logseq, block);

}
logseq.ready(main).catch(console.error);
