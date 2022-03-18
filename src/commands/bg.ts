import "@logseq/libs";
import { useColorStore } from "@/stores/color";
import { ParsedArgs } from "minimist";
import { filterDarkColor } from "@/common/funcs";

export const picker = () => {
  const colorStore = useColorStore();
  colorStore.show();
};

export const random = async () => {
  const colorStore = useColorStore();
  const namedColors = [...Object.keys(colorStore.namedColors)].filter(
    (color) => {
      const hexColor = colorStore.namedColors[color];
      return filterDarkColor(hexColor);
    }
  );
  const shuffled = namedColors.sort(() => 0.5 - Math.random());
  const selected = await logseq.Editor.getSelectedBlocks();
  if (selected && selected.length > 1) {
    const mapped = selected.map((block, index) =>
      logseq.Editor.upsertBlockProperty(
        block.uuid,
        "background-color",
        shuffled[index % shuffled.length]
      )
    );
    await Promise.all(mapped);
  } else {
    const block = await logseq.Editor.getCurrentBlock();
    if (block) {
      await logseq.Editor.upsertBlockProperty(
        block.uuid,
        "background-color",
        shuffled[0]
      );
      // Why this doesn't work?
      await logseq.Editor.exitEditingMode(true);
    }
  }
};

export const clear = async () => {
  const selected = await logseq.Editor.getSelectedBlocks();
  if (selected && selected.length > 1) {
    const mapped = selected.map((block) =>
      logseq.Editor.upsertBlockProperty(block.uuid, "background-color", null)
    );
    await Promise.all(mapped);
  } else {
    const block = await logseq.Editor.getCurrentBlock();
    if (block) {
      await logseq.Editor.upsertBlockProperty(
        block.uuid,
        "background-color",
        null
      );
      // Why this doesn't work?
      await logseq.Editor.exitEditingMode(true);
    }
  }
};

export const set = async (argv: ParsedArgs) => {
  const colorStore = useColorStore();
  const color = argv._[0];

  const namedColors = colorStore.namedColors;

  if (
    Object.keys(namedColors).includes(color) ||
    /^#[0-9a-f]{6}$/i.test(color)
  ) {
    const selected = await logseq.Editor.getSelectedBlocks();
    if (selected && selected.length > 1) {
      const mapped = selected.map((block) =>
        logseq.Editor.upsertBlockProperty(block.uuid, "background-color", color)
      );
      await Promise.all(mapped);
    } else {
      const block = await logseq.Editor.getCurrentBlock();
      if (block) {
        await logseq.Editor.upsertBlockProperty(
          block.uuid,
          "background-color",
          color
        );
        // Why this doesn't work?
        await logseq.Editor.exitEditingMode(true);
      }
    }
  }
};
