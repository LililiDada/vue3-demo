<template>
  <div class="warp">
    <div
      class="box"
      v-hammer:pinch="onPinch"
      v-hammer:pinchstart="onPinchstart"
      v-hammer:pinchend="onPinchend"
      v-hammer:rotate="onRotate"
      v-hammer:rotatestart="onRotatestart"
      v-hammer:rotateend="onRotateend"
      v-hammer:rotatemove="onRotatemove"
      v-hammer:pan="onPan"
    >
      <div
        id="pasterId"
        :class="['animate', pasterConfig.focusFlag && 'borderA']"
        :hidefocus="true"
        @focus="onFoucs"
        @blur="onBlur"
      >
        <img src="@/assets/3.png" alt="" class="src" />
        <div id="opposite1" class="opposite1"></div>
        <div id="opposite2" class="opposite2"></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const CONSTANT = {
  START_X: 54,
  START_Y: 40,
  MAX_SCALE: 0.2, // 最小缩放比例
  MIN_SCALE: 6, // 最大缩放比例
  INIY_WH: 87, // 原始框大小
};

const pasterConfig = ref({
  transform: {
    translate: {
      x: 0,
      y: 0,
    },
    scale: 1,
    angle: 0,
    rx: 0,
    ry: 0,
    rz: 0,
  },
  initAngle: 0, // 旋转角度
  initScale: 1, // 放大倍数
  // 旋转相关
  preAngle: 0,
  tempAngleFlag: 0,
  deltaAngle: 0,
  startRotateAngle: 0,
  focusFlag: false, // 是否获取到焦点
  noPan: false, // 禁止拖拽
  imgCenter: {
    // 单点操作中心坐标
    x: 0,
    y: 0,
  },
  oldDistance: 0, // 开始旋转式图片中心点到出点的距离
  preWidth: 0, // 开始单点操作时图片的宽度
});

// 操作开始时图片宽高，中心点，半径
const getInfo = () => {
  const opp1 = document.getElementById('opppsite1')?.getBoundingClientRect();
  const opp2 = document.getElementById('opppsite3')?.getBoundingClientRect();
  if (opp1 && opp2) {
    // 计算出图片的中心坐标
    pasterConfig.value.imgCenter = {
      x: (opp1?.x + opp2?.x) / 2,
      y: (opp1?.y + opp2?.y) / 2,
    };
    // 移动开始时触点到图片中心点的距离
    pasterConfig.value.oldDistance = Math.sqrt(
      Math.pow(opp2.x - pasterConfig.value.imgCenter.x, 2) +
        Math.pow(opp2.y - pasterConfig.value.imgCenter.y, 2),
    );
    // 开始移动时图片的宽度
    // pasterConfig.value.preWidth = Math.sqrt(2*)
  }
};

const onFoucs = () => {
  pasterConfig.value.focusFlag = true;
};

const onBlur = () => {
  pasterConfig.value.focusFlag = false;
};

const onPan = (e: HammerInput) => {
  console.log('onPan===========================', e);
  // 单点，或多指操作时禁止移动
  if (pasterConfig.value.noPan) return;

  onFoucs();
  pasterConfig.value.transform.translate.x = CONSTANT.START_X + e?.deltaX;
};

const onPinch = (e: any) => {
  console.log('onPinch===========================', e);
};

const onPinchstart = (e: any) => {
  console.log('onPinchstart===========================', e);
};

const onPinchend = (e: any) => {
  console.log('onPinchend===========================', e);
};

const onRotate = (e: any, distence: any) => {
  console.log(distence, 'onRotate===========================', e);
};

const onRotatestart = (e: any) => {
  console.log('onRotatestart===========================', e);
};

const onRotateend = (e: any) => {
  console.log('onRotateend===========================', e);
};

const onRotatemove = (e: any) => {
  console.log('onRotatemove===========================', e);
};
</script>
<style scoped>
.box {
  width: 400px;
  height: 400px;
  background-color: pink;
}
</style>
