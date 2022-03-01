import "@logseq/libs";
import { useMarkStore } from "@/stores/mark";

export function marks() {
  const markStore = useMarkStore();
  markStore.reload();
  markStore.toggle();
}

export async function deleteMarks(ids: string[]) {
  const markStore = useMarkStore();
  await markStore.deleteMarks(ids);
  markStore.reload();
}

export function mark(id: string) {
  const markStore = useMarkStore();
  const m = markStore.getMark(id);
  if (m) {
    if (m.block) {
      logseq.Editor.scrollToBlockInPage(m.page, m.block);
    } else {
      logseq.App.pushState("page", {
        name: m.page,
      });
    }
  }
}

export async function clearMarks() {
  const markStore = useMarkStore();
  await markStore.clearMarks();
  markStore.reload();
}
