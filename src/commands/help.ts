import { useHelpStore } from "@/stores/help";
export function show() {
  const helpStore = useHelpStore();
  helpStore.show();
}
