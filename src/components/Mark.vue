<script lang="ts" setup>
import { useMarkStore } from "../stores/mark";

const mark = useMarkStore();

const handleClose = () => {
  const el = document.querySelector(".command-input input") as HTMLInputElement;
  el && el.focus();
};
const handleClick = async (mark) => {
  if (mark) {
    if (mark.block) {
      logseq.Editor.scrollToBlockInPage(mark.page, mark.block);
    } else {
      logseq.App.pushState("page", {
        name: mark.page,
      });
    }
  }
};
</script>

<template>
  <el-drawer
    v-model="mark.visible"
    :title="mark.title"
    direction="rtl"
    @close="handleClose"
  >
    <el-timeline>
      <el-timeline-item
        v-for="m in mark.marks"
        :key="m.key"
        :icon="m.icon"
        :color="m.color"
        :timestamp="m.block"
      >
        <a class="cursor-pointer" @click="handleClick(m)">
          {{ m.key }}:
          {{ m.page }}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 inline-block"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
              clip-rule="evenodd"
            /></svg
        ></a>
      </el-timeline-item>
    </el-timeline>
  </el-drawer>
</template>

<style></style>
