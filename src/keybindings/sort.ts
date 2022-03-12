import { BlockEntity, ILSPluginUser } from "@logseq/libs/dist/LSPlugin";

export default (logseq: ILSPluginUser) => {
  const sortHandler = async () => {
    const curBlock = await logseq.Editor.getCurrentBlock();
    const selected = await logseq.Editor.getSelectedBlocks();
    const isEditing = await logseq.Editor.checkEditing();
    if (curBlock) {
      if (isEditing || (selected && selected.length === 1)) {
        const block = await logseq.Editor.getBlock(curBlock.uuid, {
          includeChildren: true,
        });
        const blocks = block.children;
        for (let i = 0; i < blocks.length; i++) {
          for (let j = 0; j < blocks.length - i; j++) {
            const a = blocks[j] as BlockEntity;
            const b = blocks[j + 1] as BlockEntity;
            if (
              a &&
              b &&
              a.content.localeCompare(b.content, "en", { numeric: true }) > 0
            ) {
              try {
                await logseq.Editor.moveBlock(a.uuid, b.uuid, {
                  before: false,
                  children: false,
                });
              } catch (e) {}
              [blocks[j], blocks[j + 1]] = [blocks[j + 1], blocks[j]];
            }
          }
        }
      } else {
        if (selected && selected.length > 1) {
          logseq.App.showMsg("Please select only one block!");
          return;
        }
      }
    }
  };

  const rsortHandler = async () => {
    const curBlock = await logseq.Editor.getCurrentBlock();
    const selected = await logseq.Editor.getSelectedBlocks();
    const isEditing = await logseq.Editor.checkEditing();
    if (curBlock) {
      if (isEditing || (selected && selected.length === 1)) {
        const block = await logseq.Editor.getBlock(curBlock.uuid, {
          includeChildren: true,
        });
        const blocks = block.children;
        for (let i = 0; i < blocks.length; i++) {
          for (let j = 0; j < blocks.length - i; j++) {
            const a = blocks[j] as BlockEntity;
            const b = blocks[j + 1] as BlockEntity;
            if (
              a &&
              b &&
              a.content.localeCompare(b.content, "en", { numeric: true }) < 0
            ) {
              try {
                await logseq.Editor.moveBlock(a.uuid, b.uuid, {
                  before: false,
                  children: false,
                });
              } catch (e) {}
              [blocks[j], blocks[j + 1]] = [blocks[j + 1], blocks[j]];
            }
          }
        }
      } else {
        if (selected && selected.length > 1) {
          logseq.App.showMsg("Please select only one block!");
          return;
        }
      }
    }
  };

  logseq.Editor.registerSlashCommand("Sort Blocks", sortHandler);
  logseq.Editor.registerSlashCommand("Reverse Sort Blocks", rsortHandler);
};
