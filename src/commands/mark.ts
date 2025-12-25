import "@logseq/libs";
import { useMarkStore } from "@/stores/mark";
import { getBlockMark, getPageMark } from "@/common/funcs";

export function marks() {
  const markStore = useMarkStore();
  markStore.reload();
  markStore.toggle();
}

export async function deleteMarks(ids: string[]) {
  const markStore = useMarkStore();
  for (const id of ids) {
    // Try to delete from both block and page marks
    // The delMark function will handle if it doesn't exist
    const blockMark = getBlockMark(parseInt(id, 10));
    const pageMark = getPageMark(parseInt(id, 10));

    if (blockMark) {
      await markStore.deleteBlockMark(id);
    }
    if (pageMark) {
      await markStore.deletePageMark(id);
    }
  }
  markStore.reload();
}

export function mark(id: string) {
  const num = parseInt(id, 10);

  // Try block mark first
  const blockMark = getBlockMark(num);
  if (blockMark) {
    logseq.Editor.scrollToBlockInPage(blockMark.page, blockMark.block);
    return;
  }

  // Try page mark
  const pageMark = getPageMark(num);
  if (pageMark) {
    logseq.App.pushState("page", {
      name: pageMark.page,
    });
  }
}

export async function clearMarks() {
  const markStore = useMarkStore();
  await markStore.clearMarks();
  markStore.reload();
}
