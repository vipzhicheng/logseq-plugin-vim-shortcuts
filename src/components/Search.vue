<script setup lang="ts">
import { useSearchStore } from "@/stores/search";
const searchStore = useSearchStore();
</script>

<template>
  <div>
    <el-input
      v-model="searchStore.input"
      v-show="searchStore.visible"
      placeholder="Please input keywords for searching in this page"
      class="w-full search-input absolute bottom-0 font-mono font-bold z-50"
      size="large"
      @click="searchStore.search"
    >
      <template #prepend>/</template>
    </el-input>
  </div>
</template>

<style>
.search-input {
  position: absolute;
}
</style>
