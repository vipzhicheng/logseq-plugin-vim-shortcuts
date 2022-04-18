import { BlockEntity } from "@logseq/libs/dist/LSPlugin";
import { defineStore } from "pinia";

const flatBlocks = (blocks: BlockEntity[]) => {
  let flat = {};
  blocks.forEach((block) => {
    flat = Object.assign({}, flat, {
      [block.uuid]: block.content,
    });

    if (block.children) {
      flat = Object.assign(
        {},
        flat,
        flatBlocks(block.children as BlockEntity[])
      );
    }
  });

  return flat;
};

export const useSearchStore = defineStore("search", {
  state: () => ({
    visible: false,
    input: "",
  }),
  actions: {
    toggle() {
      this.visible = !this.visible;
    },

    show() {
      this.visible = true;
    },

    hide() {
      this.visible = false;
    },

    emptyInput() {
      this.input = "";
    },

    async search() {
      const blocks = await logseq.Editor.getCurrentPageBlocksTree();
      const flatedBlocks = flatBlocks(blocks);

      console.log("flatedBlocks", flatedBlocks, blocks);
    },
  },
});
