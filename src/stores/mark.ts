import { defineStore } from "pinia";
import { clearMarks, delMark, getMark, getMarks } from "@/common/funcs";

export const useMarkStore = defineStore("mark", {
  state: () => ({
    visible: false,
    title: "Marks",
    content: "",
    marks: [],
  }),
  actions: {
    toggle() {
      this.visible = !this.visible;
    },
    close() {
      this.visible = false;
    },
    async deleteMarks(numbers: string[]) {
      for (let number of numbers) {
        await delMark(number);
      }
    },
    getMark(number) {
      return getMark(number);
    },
    async clearMarks() {
      await clearMarks();
    },
    reload() {
      const marksObj = getMarks();
      this.marks = Object.keys(marksObj).map((key) => {
        return {
          ...marksObj[key],
          key,
          color: marksObj[key].block ? "#b3e19d" : "#66b1ff",
        };
      });
    },
  },
});
