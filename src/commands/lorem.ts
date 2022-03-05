import "@logseq/libs";
import { loremIpsum } from "lorem-ipsum";
export async function generate(argv) {
  let block = await logseq.Editor.getCurrentBlock();
  if (!block) {
    logseq.App.showMsg("No block selected!");
    return;
  }
  const lines = parseInt(argv._[0]) || 1;
  const unit = ["paragraph", "sentence", "word"].includes(argv.unit)
    ? argv.unit
    : "sentence";

  let currentBlockFilled = false;
  for (let i = 0; i < lines; i++) {
    const text = loremIpsum({
      count: 1,
      units: unit,
      format: "plain",
      sentenceLowerBound: 5,
      sentenceUpperBound: 15,
    });
    if (!block.content && !currentBlockFilled) {
      await logseq.Editor.updateBlock(block.uuid, text);
      currentBlockFilled = true;
    } else {
      await logseq.Editor.insertBlock(block.uuid, text, {
        before: false,
        sibling: true,
      });
    }
  }
}
