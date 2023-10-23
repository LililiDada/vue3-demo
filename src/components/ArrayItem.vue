<template>
  <div :class="!!header ? 'selected' : ''" @click="handleArray">{{ name }}</div>
</template>
<script setup lang="ts">
import useArrayStore from '@/store/array';
const arrayStore = useArrayStore();
interface IProps {
  name: string;
  header?: boolean;
  isHeaderIcon?: boolean;
  item: object;
}

// const { isHeaderIcon, item, header } = toRefs(defineProps<IProps>());
// const handleArray = () => {
//   if (isHeaderIcon.value) return arrayStore.delArray(item);
//   if (!isHeaderIcon.value && !header.value) return arrayStore.addArray(item);
// };

const props = defineProps<IProps>();
const handleArray = () => {
  if (props.isHeaderIcon) return arrayStore.delArray(props.item);
  if (!props.isHeaderIcon && !props.header)
    return arrayStore.addArray(props.item);
};
</script>
<style lang="less" scoped>
.selected {
  color: aquamarine;
}
</style>
