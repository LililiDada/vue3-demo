<template>
  <div>
    <canvas
      ref="canvasRef"
      class="signature-canvas"
      :width="width"
      :height="height"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
      @touchstart.prevent="startDrawing"
      @touchmove.prevent="draw"
      @touchend="stopDrawing"
    />
    <div class="mt-2">
      <button @click="clearCanvas">清除</button>
      <button @click="saveSignature">保存为图片</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  width: { type: Number, default: 500 },
  height: { type: Number, default: 200 },
  strokeColor: { type: String, default: '#000' },
  strokeWidth: { type: Number, default: 2 },
});

const canvasRef = ref(null);
const ctx = ref(null);
let drawing = false;
let hasMoved = false;

const getPos = (e) => {
  const rect = canvasRef.value.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  } else {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }
};

const startDrawing = () => {
  drawing = true;
  hasMoved = false;
  ctx.value.beginPath();
};

const draw = (e) => {
  if (!drawing) return;
  const pos = getPos(e);

  if (!hasMoved) {
    ctx.value.moveTo(pos.x, pos.y);
    hasMoved = true;
  } else {
    ctx.value.lineTo(pos.x, pos.y);
    ctx.value.stroke();
  }
};

const stopDrawing = () => {
  if (!drawing) return;
  drawing = false;
  ctx.value.closePath();
};

const clearCanvas = () => {
  ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
};

const saveSignature = () => {
  const dataURL = canvasRef.value.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'signature.png';
  link.click();
};

onMounted(() => {
  ctx.value = canvasRef.value.getContext('2d');
  ctx.value.lineCap = 'round';
  ctx.value.strokeStyle = props.strokeColor;
  ctx.value.lineWidth = props.strokeWidth;
});
</script>

<style scoped>
.signature-canvas {
  border: 1px solid #ccc;
  touch-action: none;
}
</style>
