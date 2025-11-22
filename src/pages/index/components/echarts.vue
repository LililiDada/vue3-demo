<template>
  <div ref="domBox" :style="{ width, height }">
    <div ref="domRef" :style="{ width, height }"></div>
  </div>
</template>

<script lang="ts" setup>
import type { ECharts } from 'echarts';
import echarts from '@/utils/echarts/index';
import { replaceVarStrings } from '@/utils/echarts/utils';
import { useTheme } from '../hooks/theme.ts';

const props = defineProps({
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '100%',
  },
  options: {
    type: Object,
    default: null,
  },
});

const { isDark } = useTheme();

const domRef = ref(null);
const domBox = ref(null);
let chartObj: null | ECharts = null;
let observer: null | MutationObserver = null; // dom监听

onMounted(() => {
  if (!domRef.value) return;
  init();

  // 若未传递 options，显示加载状态
  !props.options &&
    chartObj &&
    chartObj.showLoading({
      text: '',
      color: '#409eff',
      textColor: '#000',
      maskColor: 'rgba(255,255,255,.95)',
      zlevel: 0,
      lineWidth: 2,
    });

  // 若已传递 options，直接渲染图表
  if (props.options) {
    drawOption();
  }

  // 初始化 MutationObserver：监听 domBox 的 DOM 变化（如宽高修改）
  observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList)
      if (mutation.target === domBox.value) chartObj && chartObj.resize();
  });

  // nextTick：确保 DOM 完全渲染后再监听（避免监听时 DOM 未更新）
  nextTick(() => {
    domBox.value &&
      (observer as MutationObserver).observe(domBox.value, {
        attributes: true, // 监听 DOM 属性变化（如 style、class 变化）
        childList: false, // 不监听子元素增减
        characterData: true, // 监听文本内容变化（此处次要，主要为 attributes）
        subtree: true, // 监听子树（后代元素）的变化
      });
  });

  // 延迟 1 秒触发 resize：兼容部分场景下 DOM 尺寸未完全稳定的问题
  setTimeout(() => {
    chartObj && chartObj.resize();
  }, 1000);
});

onUnmounted(() => {
  if (chartObj) {
    chartObj.dispose();
    chartObj = null;
  }
  // 注意销毁监听器
  observer && observer.disconnect();
});

watch(
  () => props.options,
  () => drawOption(),
);

watch(
  () => isDark.value,
  () => drawOption(),
);

// 初始化
const init = () => {
  chartObj = echarts.init(domRef.value) as any;
};

const drawOption = () => {
  if (!chartObj) return;
  if (!props.options) {
    chartObj.clear();
    chartObj.showLoading({
      text: '',
      color: '#409eff',
      textColor: '#000',
      maskColor: 'rgba(255, 255, 255, .95)',
      zlevel: 0,
      lineWidth: 2,
    });
  } else {
    chartObj.hideLoading();
    chartObj.setOption(replaceVarStrings(props.options));
  }
};
</script>

<!-- 监听dom更新核心
1.调用init(),创建ECharts实例
2.根据props.options是否存在,显示加载状态或直接渲染图表
3.初始化MutationObserver,监听外出容器domBox的属性变化(如宽高修改),出发图标自适应
4.nextTick:确保DOM完全渲染后再启动监听,避免监听无效
5.延迟resize:兼容部分场景(如父组件动态修改宽高后,DOM尺寸未及时更新)
-->
