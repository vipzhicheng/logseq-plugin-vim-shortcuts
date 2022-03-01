import "@logseq/libs";

export async function redo() {
  // @ts-ignore
  await logseq.App.invokeExternalCommand("logseq.editor/redo");
}

export async function undo() {
  // @ts-ignore
  await logseq.App.invokeExternalCommand("logseq.editor/undo");
}

export async function backward() {
  // @ts-ignore
  await logseq.App.invokeExternalCommand("logseq.go/backward");
}

export async function forward() {
  // @ts-ignore
  await logseq.App.invokeExternalCommand("logseq.go/forward");
}
