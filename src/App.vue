<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
// import QrCode from './components/QrCode.vue';
// import ArrayCondition from './components/ArrayCondition.vue';
// import GetArrayOne from './components/GetArrayOne.vue';
import Draggable from './components/Draggable.vue';
import createCustomComponent from './hooks/createCustomCompoent';
const Customcomponent = createCustomComponent('draggable', Draggable);

console.log(Customcomponent, '=========Customcomponent');
</script>

<template>
  <!-- <HelloWorld msg="Vite + Vue" /> -->
  <!-- <QrCode /> -->
  <!-- <ArrayCondition /> -->
  <!-- <GetArrayOne /> -->
  <!-- <Draggable /> -->
  <Customcomponent />
</template>

<style scoped>
.logo {
  padding: 1.5em;
  height: 6em;
  transition: filter 300ms;
  will-change: filter;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
