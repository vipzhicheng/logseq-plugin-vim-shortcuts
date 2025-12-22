import "@logseq/libs";
import { loremIpsum } from "lorem-ipsum";
export async function generate(argv) {
  let block = await logseq.Editor.getCurrentBlock();
  if (!block) {
    logseq.UI.showMsg("No block selected!");
    return;
  }

  let u = argv.unit || argv.u;
  const uMapping = {
    p: "paragraph",
    w: "word",
    s: "sentence",
  };
  if (uMapping[u]) {
    u = uMapping[u];
  }

  const lines = parseInt(argv._[0]) || 1;
  let unit = ["paragraph", "sentence", "word"].includes(u) ? u : "sentence";
  if (argv.paragraph || argv.p) {
    unit = "paragraph";
  } else if (argv.sentence || argv.s) {
    unit = "sentence";
  } else if (argv.word || argv.w) {
    unit = "word";
  }

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
