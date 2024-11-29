<template>
  <i
    :class="`chan-icon chan-icon-${type}`"
    :style="styles"
    @click="clickHandler"
  />
</template>
<script setup lang="ts">
import { CSSProperties } from 'vue';

interface IChanIconProps {
  type: string;
  size?: number | string;
  color?: string;
}
const { size, color } = defineProps<IChanIconProps>();
const emits = defineEmits(['click']);

const styles = computed(() => {
  const style: CSSProperties = {};
  if (size) {
    style['font-size'] = `${size}px`;
  }
  if (color) {
    style.color = color;
  }
  return style;
});
const clickHandler = (event: MouseEvent) => {
  emits('click', event);
};
</script>
