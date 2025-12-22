<script setup lang="ts">
import { useCopyTextStore } from "@/stores/copy-text";
import clipboardy from "clipboardy";
import "@logseq/libs";

const copyTextStore = useCopyTextStore();

const handleClick = () => {
  clipboardy.write(copyTextStore.content);
  logseq.UI.showMsg("Copied to clipboard");
};
</script>

<template>
  <el-dialog
    v-model="copyTextStore.visible"
    :title="copyTextStore.title"
    :width="copyTextStore.width"
    top="25vh"
    center
    draggable
  >
    <div class="flex flex-row justify-between gap-4">
      <div class="font-bold" v-html="copyTextStore.content"></div>
      <div @click="handleClick" class="cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  </el-dialog>
</template>

<style></style>
