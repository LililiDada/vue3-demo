<template>
  <van-checkbox
    v-model="usernameChecked"
    :disabled="infoShowMap.username"
    @click="box('username')"
  >
    个人姓名</van-checkbox
  >
  <van-checkbox
    v-model="custnameChecked"
    :disabled="infoShowMap.custname"
    @click="box('custname')"
  >
    企业名称</van-checkbox
  >
</template>

<script setup lang="ts">
import { ref } from 'vue';

const usernameChecked = ref(false);
const custnameChecked = ref(false);
const detail = {
  username: 'example', // 你的数据对象
  showCustname: '0',
};

const infoShowMap: Record<string, boolean> = {
  username: !detail.username,
  custname: detail.showCustname === '0',
};

const box = (prop: string) => {
  console.log(infoShowMap[prop], '是否可选');
};
</script>
