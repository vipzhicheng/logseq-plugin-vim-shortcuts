<script setup lang="ts">
import { ColorPicker } from "vue-color-kit";
import "vue-color-kit/dist/vue-color-kit.css";

import { useColorStore } from "@/stores/color";
const colorStore = useColorStore();
</script>

<template>
  <ColorPicker
    v-if="colorStore.visible"
    class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 box-content"
    theme="light"
    :color="colorStore.color"
    :colors-default="colorStore.colorsDefault"
    :sucker-hide="colorStore.hide"
    :sucker-canvas="colorStore.suckerCanvas"
    :sucker-area="colorStore.suckerArea"
    @changeColor="colorStore.changeColor"
  />
</template>

<style></style>
