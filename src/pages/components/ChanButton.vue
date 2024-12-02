<template>
  <van-button
    v-bind="$attrs"
    class="chan-button"
    :class="[
      textBtn ? 'chan-button-text' : '',
      isWhiteType ? 'chan-btn-white-bg' : '',
    ]"
    :style="btnStyle"
    @click="onClick"
  >
    <template #[slotName] v-for="slotName in Object.keys($slots)">
      <slot :name="slotName"></slot>
    </template>
  </van-button>
</template>
<script setup lang="ts">
interface IProps {
  textBtn?: boolean;
  btnStyle?: string;
  isWhiteType?: boolean;
}
defineProps<IProps>();
const emits = defineEmits(['click']);
const onClick = (e: MouseEvent) => {
  emits('click', e);
};
</script>
<style lang="less" scoped>
@import url('@/styles/common.less');

.chan-button {
  font-size: 16px;
  white-space: nowrap;
  border-radius: 20px;
  &.van-button {
    height: 40px;
    &--default {
      color: #fff;
      background: @brand-blue-primary;
      border: none;
      &:active {
        opacity: 0.8;
      }
    }

    &--disabled:not(.chan-button-text) {
      background: @achromatic-gray-disabled;
    }
    &--plain {
      color: @brand-blue-primary;
      background-color: #fff;
      border: 1px solid @brand-blue-primary;
      &:active {
        color: @brand-blue-disable;
        border-color: @brand-blue-disable;
        &::before {
          background-color: transparent;
        }
      }
    }
    &--normal {
      min-width: 30px;
    }
    &--smal1 {
      min-width: 90px;
      height: 30px;
      font-size: 14px;
      border-radius: 15px;
    }
    &--mini {
      min-width: 70px;
      font-size: 12px;
      border-radius: 5px;
    }
  }

  &-text {
    &.van-button--default {
      color: brand-blue-primary;
      background-color: transparent;
      border: none;
      &::before {
      }
      background-color: transparent;
    }
  }
}
chan-btn-white-bg {
  color: @brand-blue-primary !important;
  background: #fff !important;
  border: 1px solid @brand-blue-primary !important;
  border-radius: 20px;
  &[disabled] {
    color: @achromatic-gray-light !important;
    border: 1px solid achromatic-gray-light !important;
  }
  &:active {
    opacity: 0.8;
  }
}
</style>
