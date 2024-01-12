<template>
  <div class="warp" v-hammer:pan="onPan">
    <div class="box"></div>
  </div>
</template>
<script setup lang="ts">
const onPan = (e: any) => {
  console.log(e, '=========打印');
};
</script>
<style scoped>
.box {
  width: 100px;
  height: 100px;
  background-color: pink;
}
</style>
