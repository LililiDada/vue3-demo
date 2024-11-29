<template>
  <div class="chan-tips">
    <chan-icon type="tip-reminder" color="#ff9501" />
    <div class="tips-block">
      <div v-if="title" class="tips-block-title">{{ title }}</div>
      <div class="tips-block-content">
        <p v-if="content">{{ content }}</p>
        <slot v-else name="content"></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import ChanIcon from './ChanIcon.vue';

interface IChanTipsProps {
  content?: string;
  title?: string;
}

const { content, title } = withDefaults(defineProps<IChanTipsProps>(), {
  title: '温馨提示',
});
</script>
<style scoped lang="less">
@import url('@/styles/common.less');

.chan-tips {
  display: flex;
  padding: 15px;

  .tips-block {
    margin-left: 5px;
    color: @achromatic-black-secondary;

    &-title {
      margin-bottom: 8px;
      line-height: 1.1;
    }

    &-content {
      font-size: 12px;
      line-height: 22px;
    }
  }
}
</style>
