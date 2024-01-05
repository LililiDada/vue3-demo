<template>
  <div>=======选中========</div>
  <template v-for="item in homeArray" :key="item.name">
    <array-item :name="item.name" :isHeaderIcon="true" :item="item" />
  </template>
  <br />
  <div>=======全部========</div>
  <template v-for="item in allArray" :key="item.name">
    <array-item
      :name="item.name"
      :header="isHeader(item)"
      :isHeaderIcon="false"
      :item="item"
    />
  </template>
</template>
<script setup lang="ts">
import { onMounted, computed } from 'vue';
import ArrayItem from './ArrayItem.vue';
import useArrayStore from '@/store/array';
const arrayStore = useArrayStore();
const { homeArray, allArray } = arrayStore;

onMounted(() => {
  arrayStore.updateHomeArray();
});
const isHeader = computed(() => (item: any) => {
  const index = homeArray.findIndex((iten) => iten.name === item.name);
  return index > -1 ? true : false;
});
</script>
