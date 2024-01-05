<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
</script>

<template>
  <div class="app" v-cloak>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" v-if="route.meta.keepAlive"></component>
      </keep-alive>
      <component :is="Component" v-if="!route.meta.keepAlive"></component>
    </router-view>
  </div>
</template>
