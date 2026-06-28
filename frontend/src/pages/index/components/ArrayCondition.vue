<template>
  <div v-for="(item, index) in list" :key="index">{{ item.title }}</div>
</template>
<script setup lang="ts">
let list: any[] = [];

const query: any = {
  status: '0',
  name: '00',
};

let array = [
  {
    title: '名称1',
    status: '0',
    name: '00',
  },
  {
    title: '名称2',
    status: '0',
    name: '00',
  },
  {
    title: '名称3',
    status: '1',
    name: '01',
  },
  {
    title: '名称4',
    status: '0',
    name: '00',
  },
];

// 效率高
list = array.filter((item: any) =>
  //   for (const key in query) {
  //     if (query[key] !== item[key]) {
  //       return false;
  //     }
  //   }
  //   return true;
  Object.entries(query).every(([key, value]) => item[key] === value),
);

const filteredArray = [];
for (const item of array) {
  if (
    Object.entries(query).every(([key, value]) => (item as any)[key] === value)
  ) {
    filteredArray.push(item);
  }
}
</script>
