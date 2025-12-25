import { defineStore } from "pinia";
import {
  clearMarks,
  clearBlockMarks,
  clearPageMarks,
  delMark,
  getMark,
  getBlockMarks,
  getPageMarks,
} from "@/common/funcs";

export const useMarkStore = defineStore("mark", {
  state: () => ({
    visible: false,
    title: "Marks",
    content: "",
    marks: [],
    blockMarks: [],
    pageMarks: [],
  }),
  actions: {
    toggle() {
      this.visible = !this.visible;
    },
    close() {
      this.visible = false;
    },
    async deleteBlockMark(number: string) {
      await delMark(number, false);
    },
    async deletePageMark(number: string) {
      await delMark(number, true);
    },
    async clearBlockMarks() {
      await clearBlockMarks();
    },
    async clearPageMarks() {
      await clearPageMarks();
    },
    getBlockMark(number: number) {
      return getMark(number, false);
    },
    getPageMark(number: number) {
      return getMark(number, true);
    },
    async clearMarks() {
      await clearMarks();
    },
    reload() {
      const blockMarksObj = getBlockMarks();
      const pageMarksObj = getPageMarks();

      this.blockMarks = Object.keys(blockMarksObj).map((key) => {
        return {
          ...blockMarksObj[key],
          key,
          color: "#b3e19d",
        };
      });

      this.pageMarks = Object.keys(pageMarksObj).map((key) => {
        return {
          ...pageMarksObj[key],
          key,
          color: "#66b1ff",
        };
      });

      // Merge for backward compatibility (if needed elsewhere)
      this.marks = [...this.blockMarks, ...this.pageMarks];
    },
  },
});
