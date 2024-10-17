<template>
  <img
    src="@images/avatar-guide.png"
    alt="抖动图片"
    :class="{ shake: isShaking }"
  />
  <button @click="startShaking">开始抖动</button>

  <div class="retain-container">
    <div class="retain-model">
      <img src="@images/model-avatar.png" class="avatar" alt="" />
      <img
        src="@images/close-white.png"
        class="retain-close"
        alt=""
        @click="close"
      />
      <div class="tip">
        <div>真的要离开吗？</div>
        <div>请问您遇到什么问题了？</div>
      </div>
      <div class="btn-box">
        <div class="box-item low-amount" @click="guideIncreaseAmount">
          额度太低
        </div>
        <div class="box-item contact" @click="guideContact">
          <div>我要联系</div>
          <div>客户经理</div>
        </div>
        <div class="box-item" @click="leave">直接离开</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isShaking = ref(false);

const startShaking = () => {
  isShaking.value = true;

  // 在6秒后停止抖动
  setTimeout(() => {
    isShaking.value = false;
  }, 6000);
};

const close = () => {};

const leave = () => {
  this.$router.back();
};

const guideIncreaseAmount = () => {
  // 未点击过提额按钮,气泡引导
  if (!this.info?.alreadyAmount) {
    close();
    return;
  }

  // 直接退出
};

const guideContact = () => {
  this.$bridge.goToLoanConsultPage();
};
</script>
<style scoped lang="less">
.shake {
  animation: shake 0.8s ease-in-out infinite; /* 动画持续0.5秒，每次循环 */
}

@keyframes shake {
  0% {
    transform: translateX(0) rotate(0deg);
  } /* 初始位置 */
  10% {
    transform: translateX(-3px) rotate(-3deg);
  } /* 适度左抖 + 左倾斜 */
  20% {
    transform: translateX(3px) rotate(3deg);
  } /* 适度右抖 + 右倾斜 */
  30% {
    transform: translateX(-4px) rotate(-4deg);
  } /* 小幅左抖 + 左倾 */
  40% {
    transform: translateX(4px) rotate(4deg);
  } /* 小幅右抖 + 右倾 */
  50% {
    transform: translateX(0) rotate(0deg);
  } /* 恢复原位 */
  60% {
    transform: translateX(-2px) rotate(-3deg);
  } /* 轻微左抖 + 左倾 */
  70% {
    transform: translateX(2px) rotate(3deg);
  } /* 轻微右抖 + 右倾 */
  80% {
    transform: translateX(-1px) rotate(-2deg);
  } /* 最小左抖 + 轻微左倾 */
  90% {
    transform: translateX(1px) rotate(2deg);
  } /* 最小右抖 + 轻微右倾 */
  100% {
    transform: translateX(0) rotate(0deg);
  } /* 回到初始位置 */
}

.retain-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #999999;
  .retain-model {
    height: 219px;
    width: 100%;
    background: url('@images/consultBg.png') no-repeat center center/100% 100%;
    position: absolute;
    bottom: 0;
    .avatar {
      position: absolute;
      width: 85px;
      height: 69px;
      left: 50%;
      top: -33.5px;
      transform: translateX(-50%);
    }
    .retain-close {
      position: absolute;
      width: 13px;
      height: 13px;
      right: 16px;
      top: 11px;
    }
    .tip {
      font-family: FZLanTingHei-DB-GBK, FZLanTingHei-DB-GBK;
      font-weight: 800;
      font-size: 18px;
      color: #21496a;
      line-height: 22px;
      margin: 56px 0 25px;
    }
    .btn-box {
      margin: 0 20px;
      display: flex;
      justify-content: space-between;
      .box-item {
        width: 100px;
        height: 62px;
        background-color: #fff;
        font-family:
          PingFang SC,
          PingFang SC;
        font-weight: 400;
        font-size: 15px;
        color: #666666;
        line-height: 20px;
        border-radius: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .low-amount {
        background: #4a7ae0;
        color: #fff;
      }
      .contact {
        flex-direction: column;
      }
    }
  }
}
</style>
