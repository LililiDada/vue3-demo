<template>
  <img :src="qrCodeUrl" class="qr-code-img" />
  <br />
  <img :src="qrCodeUrl1" class="qr-code-img" />
</template>

<script setup lang="ts">
import QRCode from 'qrcode';
import { onMounted, ref } from 'vue';

const props = defineProps({
  //二维码存储内容
  qrUrl: {
    type: String,
    default: 'Hello World',
  },
  // canvas width
  width: {
    type: Number,
    default: 100,
  },
  // canvas height
  height: {
    type: Number,
    default: 100,
  },
  // 二维码尺寸（正方形 长宽相同）
  qrSize: {
    type: Number,
    default: 360,
  },
  // 二维码底部文字
  qrText: {
    type: String,
    default: 'Hello World',
  },
  //底部说明文字字号
  qrTextSize: {
    type: Number,
    default: 24,
  },
});

const qrCodeOption: QRCode.QRCodeRenderersOptions = {
  errorCorrectionLevel: 'H',
  width: props.qrSize,
  version: 7,
};

const qrCodeUrl = ref<string>('');
const qrCodeUrl1 = ref<string>('');

const handleQrcode = () => {
  let dom = document.createElement('canvas') as HTMLCanvasElement;
  QRCode.toDataURL(props.qrUrl, qrCodeOption)
    .then((url: string) => {
      // 画二维码里的logo// 在canvas里进行拼接
      const ctx = dom.getContext('2d') as CanvasRenderingContext2D;
      const image = new Image();
      image.src = url;

      qrCodeUrl1.value = url;
      console.log(url, '======url', image);
      image.onload = () => {
        ctx.drawImage(image, 0, 0, 500, 500);
        qrCodeUrl.value = dom.toDataURL('image/png');
        console.log(qrCodeUrl.value);
      };
    })
    .catch((err: Error) => {
      console.error(err);
    });
};

onMounted(() => {
  handleQrcode();
});
</script>

<style scoped>
.qr-code-img {
  width: 100px;
  height: 100px;
}
</style>
