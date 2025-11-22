<template>
  <div style="height: 300px; width: 200px">
    <BaseECharts :options="options" />
  </div>
</template>
<script setup lang="ts">
import BaseECharts from '../../components/echarts.vue';
const options = ref<any>({
  xAxis: {
    type: 'category',
    data: [],
  },
  color: ['var(--dv-color-danger)'], // 颜色的变量字符串
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [],
      type: 'line',
    },
  ],
});

setTimeout(() => {
  options.value = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    color: ['var(--dv-color-danger)'], // 颜色的变量字符串
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line',
      },
    ],
  };
}, 3000);
</script>
