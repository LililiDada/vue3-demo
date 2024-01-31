<template>
  <div
    id="warp"
    class="warp"
    v-hammer:pan="onPan"
    v-hammer:pinch="onPinch"
    v-hammer:pinchstart="onPinchstart"
    v-hammer:pinchend="onPinchEnd"
    v-hammer:rotatestart="onRotateStart"
    v-hammer:rotatemove="onRotateMove"
    v-hammer:rotateend="onRotateEnd"
  >
    <div
      id="pasterId"
      :class="['animate', focusFlag ? 'borderA' : '']"
      ref="pasterF"
      tabindex="0"
      :hidefocus="true"
      @focus="onFocus"
      @blur="onBlur"
    >
      <img src="@images/3.png" />
      <!-- 删除icon -->
      <div class="touch-X icon-dot" v-show="focusFlag" @click="cancel">
        <img src="@images/cancel_icon.jpg" />
      </div>
      <!-- 旋转 (操作)icon -->
      <div
        class="touch-dot icon-dot"
        v-show="focusFlag"
        id="dotId"
        v-hammer:pan="onPanDot"
        v-hammer:panstart="onPenStartDot"
      >
        <img src="@images/scale_icon.jpg" />
      </div>
      <!-- 对角点不展示，用于获取对角坐标-->
      <div class="opposite1" id="opposite1"></div>
      <div class="opposite2" id="opposite2"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import CustomHammer from '@/utils/hammer';

interface IProps {
  imgUrl?: string;
}
defineProps<IProps>();
const emits = defineEmits(['cancel']);
const vHammer = CustomHammer;
const CONSTANTS = {
  MIX_SCALE: 0.2, //最小缩放比例
  MAX_SCALE: 6, // 最大缩放比例
  INIY_WH: 87, // 原始框大小87px
};
const focusFlag = ref(false);
const pasterF = ref();
const transform = {
  translate: {
    x: 0,
    y: 0,
  },
  scale: 1,
  angle: 0,
  rx: 0,
  ry: 0,
  rz: 0,
};

const operData = {
  // 单点操作中心坐标
  imgCenter: {
    x: 0,
    y: 0,
  },
  //开始旋转式图片中心点到出点的距离
  oldDistance: 1,
  // 开始单点操作时图片的宽度
  preWidth: 1,
  //放大倍数
  initScale: 1,
  // 旋转角度
  initAngle: 0,
  // 禁止拖拽
  noPan: false, //x轴上的位置
  startX: 54,
  // y轴上的位置
  startY: 70,
  //旋转相关
  startRotateAngle: 0,
  tempAngleFlag: 0,
  preAngle: 0,
};

const updataElementTranform = async () => {
  const {
    translate: { x, y },
    rx,
    ry,
    rz,
    angle,
    scale,
  } = transform;
  const el = document.getElementById('pasterId') as any;
  const translate3d = `translate3d(${x}px,${y}px,0)`;
  // 厂缩放比例改成 宽高比例，避免边框其他跟着缩放
  const rotate3d = `rotate3d(${rx}px,${ry}px,${rz}px,${angle}deg)`;
  const value1 = translate3d + rotate3d;
  const value2 = `${((scale * CONSTANTS.INIY_WH) / 375) * 100}vw`;
  await nextTick();
  el.style.webkitTransform = value1; /* 为Chrome/safari */
  el.style.mozTransform = value1; /* 为 Firefox */
  el.style.transform = value1; /* IE Opera */
  el.style.width = value2;
  el.style.height = value2;
};

const gitInfo = () => {
  const opp1 = document
    .getElementById('opposite1')
    ?.getBoundingClientRect() as DOMRect;
  const opp2 = document
    .getElementById('opposite2')
    ?.getBoundingClientRect() as DOMRect;
  // 计算出图片中心点坐标
  operData.imgCenter = { x: (opp1.x + opp2.x) / 2, y: (opp1.y + opp2.y) / 2 };
  // 移动开始时出点到图片中心点的距离
  operData.oldDistance = Math.sqrt(
    (opp2.x - operData.imgCenter.x) ** 2 + (opp2.y - operData.imgCenter.y) ** 2,
  );
  // 开始移动时图片的宽度，即求等腰直角三角形的最长边
  operData.preWidth = Math.sqrt(2 * operData.oldDistance ** 2);
};

/** 单点缩放 **/
const zoom = (newDistence: number) => {
  const scale = newDistence / operData.oldDistance;
  const currentScale = operData.initScale * scale; //限制最小缩放比例
  if (currentScale < CONSTANTS.MIX_SCALE) {
    transform.scale = CONSTANTS.MIX_SCALE;
  } else if (currentScale > CONSTANTS.MAX_SCALE) {
    transform.scale = CONSTANTS.MAX_SCALE;
  } else {
    transform.scale = currentScale;
    // 让图片以中心点缩放
    // (scale -1)* operData.preidth =》 相对于原始宽度/高度的整体“变化量”，除于2是得到平均分配到上下/左右两个方向
    transform.translate.x =
      operData.startX - ((scale - 1) * operData.preWidth) / 2;
    transform.translate.y =
      operData.startY - ((scale - 1) * operData.preWidth) / 2;
  }
};

const rotate = (e: HammerInput, distence: number) => {
  // 旋转弧度
  let originRadian = 0;
  const x = e.center.x - operData.imgCenter.x;
  const y = e.center.y - operData.imgCenter.y;
  if (x >= 0 && y >= 0) {
    // 第一象限 计算与x轴正方向的夹角
    originRadian = Math.asin(y / distence);
  } else if (x < 0 && y >= 0) {
    // 第二象限 计算与x轴正方向的夹角
    originRadian = Math.asin(Math.abs(x) / distence);
    originRadian += Math.PI / 2;
  } else if (x < 0 && y < 0) {
    // 第三象限 计算与x轴正方向的夹角
    originRadian = Math.asin(x / distence);
    originRadian -= Math.PI / 2;
  } else if (x > 0 && y < 0) {
    // 第四象限 计算与x轴正方向的夹角
    originRadian = Math.asin(y / distence);
  }
  const angle = originRadian * (180 / Math.PI);
  transform.angle = angle - 45;
  console.log('旋转角度,angle');
  transform.rz = 1; // 非0 垂直xy轴
  // 单点操作结束
  if (e.isFinal) {
    operData.initAngle = transform.angle;
  }
};

const onFocus = async () => {
  await nextTick();
  pasterF.value.focus();
  focusFlag.value = true;
};

const onBlur = () => {
  focusFlag.value = false;
};

/** 单点操作开始 */
const onPenStartDot = () => {
  gitInfo();
  operData.initScale = transform.scale || 1;
};

const onPanDot = async (e: HammerInput) => {
  operData.noPan = true;
  const newDistence = Math.sqrt(
    (e.center.x - operData.imgCenter.x) ** 2 +
      (e.center.y - operData.imgCenter.y) ** 2,
  );

  zoom(newDistence);
  rotate(e, newDistence);
  updataElementTranform();
  if (e.isFinal) {
    setTimeout(() => {
      operData.noPan = false;
    }, 500);
  }
  operData.startX = transform.translate.x;
  operData.startY = transform.translate.y;
};

/** 拖动时触发 */
const onPan = (e: HammerInput) => {
  // 单点，或多指操作中禁止移动
  if (operData.noPan) return;
  onFocus();
  transform.translate.x = operData.startX + e.deltaX;
  transform.translate.y = operData.startY + e.deltaY;
  updataElementTranform();
  if (e.isFinal) {
    operData.startX = transform.translate.x;
    operData.startY = transform.translate.y;
  }
};

/**多指缩放开始 */
const onPinchstart = () => {
  onFocus();
  gitInfo();
  operData.noPan = true;
  operData.initScale = transform.scale || 1;
};

/**缩放过程*/
const onPinch = (e: HammerInput) => {
  // 限制缩放比例
  if (operData.initScale * e.scale < CONSTANTS.MIX_SCALE) {
    transform.scale = CONSTANTS.MIX_SCALE;
  } else if (operData.initScale * e.scale > CONSTANTS.MAX_SCALE) {
    transform.scale = CONSTANTS.MAX_SCALE;
  } else {
    transform.scale = operData.initScale * e.scale;
  }
  // 让图片以中心点缩放
  transform.translate.x =
    operData.startX -
    (operData.initScale * (e.scale - 1) * operData.preWidth) / 2;
  transform.translate.y =
    operData.startY -
    (operData.initScale * (e.scale - 1) * operData.preWidth) / 2;
  updataElementTranform();
};

const onPinchEnd = () => {
  setTimeout(() => {
    operData.noPan = false;
  }, 500);
};

const onRotateStart = (e: HammerInput) => {
  onFocus();
  operData.startRotateAngle = e.rotation;
  operData.tempAngleFlag = 0;
  operData.noPan = true;
};

const onRotateMove = (e: HammerInput) => {
  // 点下第二个触点时触发
  if (operData.tempAngleFlag === 0) {
    operData.preAngle = operData.startRotateAngle;
    operData.tempAngleFlag += 1;
  } else {
    transform.rz = 1; // 非 垂直xy轴
    transform.angle = operData.initAngle + e.rotation - operData.preAngle;
    updataElementTranform();
  }
};

// 旋转结束
const onRotateEnd = () => {
  // 旋转结束 记录当前图片角度
  setTimeout(() => {
    operData.noPan = false;
  }, 500);
  operData.initAngle = transform.angle;
};

const cancel = () => {
  emits('cancel');
};

const pasterInfo = () => {
  const e = document.getElementById('warp')?.getBoundingClientRect() as DOMRect;
  const opp1 = document
    .getElementById('opposite1')
    ?.getBoundingClientRect() as DOMRect;
  const opp2 = document
    .getElementById('opposite2')
    ?.getBoundingClientRect() as DOMRect;
  const left = (opp1.left + opp2.left) / 2 - e.left;
  const top = (opp1.top + opp2.top) / 2 - e.top;
  return {
    angle: transform.angle, // 贴纸转角度
    center_x: left / e.width, // 贴纸中心点x坐标比例
    center_y: top / e.height, // 贴纸中心点y坐标比例
    scale_width: (transform.scale * CONSTANTS.INIY_WH) / 188, // 贴纸宽比 贴纸宽/图片宽
    scale_height: (transform.scale * CONSTANTS.INIY_WH) / 262, // 贴纸高比例 贴纸高/图片高
    // url: baseUr1 + props.imgUrl,// 贴纸路径
  };
};

onMounted(async () => {
  transform.translate.x = operData.startX;
  transform.translate.y = operData.startY;
  updataElementTranform();
  onFocus();
});

defineExpose({ pasterInfo });
</script>
<style scoped>
.warp {
  position: relative;
  top: 0;
  z-index: 99;
  width: 188px;
  height: 262px;
  overflow: hidden;
}

.borderA {
  border: 2px solid#eee;
}

:focus-visible {
  outline: transparent;
}

:focus {
  outline: transparent;
}

.animate {
  z-index: 99;
  display: inline-block;
  img {
    width: 100%;
  }
  .icon-dot {
    background: #ffffff;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .touch-dot {
    right: -6px;
    bottom: -6px;
  }
  .touch-X {
    top: -6px;
    left: -6px;
  }

  .opposite1 {
    position: absolute;
    top: 0;
    left: 0;
  }
  .opposite2 {
    position: absolute;
    right: 0;
    bottom: 0;
  }
}
</style>
