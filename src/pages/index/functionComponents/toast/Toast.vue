<!-- Toast.vue -->
<template>
  <div v-if="visible" class="toast">
    {{ message }}
    <button @click="close">关闭</button>
    <!-- 手动关闭按钮 -->
  </div>
</template>

<script lang="ts" setup>
// 定义 props 和 emits
const props = defineProps<{
  message: string;
  autoClose: boolean; // 是否需要自动关闭
  duration?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const visible = ref(true);

let timeoutId = null;
// 自动关闭定时器
if (props.autoClose) {
  timeoutId = setTimeout(() => {
    close(); // 定时自动关闭
  }, props.duration ?? 2000);
}

// 手动关闭方法
const close = () => {
  if (timeoutId !== null) {
    clearTimeout(timeoutId); // 清除自动关闭的定时器
  }
  visible.value = false; // 隐藏组件
  emit('close'); // 触发 close 事件，通知外部
};

// 在组件卸载前清理定时器
onBeforeUnmount(() => {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }
});
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  padding: 10px 20px;
  color: white;
  background-color: rgb(0 0 0 / 70%);
  border-radius: 4px;
  transform: translateX(-50%);
}
</style>
