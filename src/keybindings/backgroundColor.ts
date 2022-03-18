import { filterDarkColor } from "@/common/funcs";
import { useColorStore } from "@/stores/color";
import { BlockEntity, ILSPluginUser } from "@logseq/libs/dist/LSPlugin";
export default (logseq: ILSPluginUser) => {
  const colorStore = useColorStore();
  const randomBackgroundColorHandler = async () => {
    const block = await logseq.Editor.getCurrentBlock();
    if (block) {
      const namedColors = [...Object.keys(colorStore.namedColors)].filter(
        (color) => {
          const hexColor = colorStore.namedColors[color];
          return filterDarkColor(hexColor);
        }
      );
      const shuffled = namedColors.sort(() => 0.5 - Math.random());
      await logseq.Editor.upsertBlockProperty(
        block.uuid,
        "background-color",
        shuffled[0]
      );
      // Why this doesn't work?
      await logseq.Editor.exitEditingMode(true);
    }
  };

  const childrenRandomBackgroundColorHandler = async () => {
    const curBlock = await logseq.Editor.getCurrentBlock();
    if (curBlock) {
      const namedColors = [...Object.keys(colorStore.namedColors)].filter(
        (color) => {
          const hexColor = colorStore.namedColors[color];
          return filterDarkColor(hexColor);
        }
      );
      const shuffled = namedColors.sort(() => 0.5 - Math.random());
      const block = await logseq.Editor.getBlock(curBlock.uuid, {
        includeChildren: true,
      });
      const blocks = block.children;
      console.log("blocks", blocks);
      const mapped = blocks.map((item, index) => {
        const block = item as BlockEntity;
        logseq.Editor.upsertBlockProperty(
          block.uuid,
          "background-color",
          shuffled[index % shuffled.length]
        );
      });
      await Promise.all(mapped);
    }
  };

  logseq.Editor.registerSlashCommand(
    "Random Bg Color",
    randomBackgroundColorHandler
  );
  logseq.Editor.registerSlashCommand(
    "Children Random Bg Color",
    childrenRandomBackgroundColorHandler
  );
};
