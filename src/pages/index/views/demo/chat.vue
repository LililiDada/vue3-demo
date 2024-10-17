<template>
  <div class="bubble-container">
    <div class="left" v-if="info.left" :style="{ top: info.top }">
      <img class="avatar" src="@images/avatar.png" />
      <img src="@images/close.png" class="close" />
      <div class="message">
        <div class="arrow"></div>
        <div>你好，这是一条消息！</div>
      </div>
    </div>
    <div class="right" :style="{ top: info.top }" v-else>
      <div class="message">
        <img src="@images/close.png" class="close" />
        <div class="arrow"></div>
        <div>你好，这是一条消息！</div>
      </div>
      <img class="avatar" src="@images/avatar.png" />
    </div>
  </div>
</template>

<script setup lang="ts">
const info = ref({
  left: true,
  top: '200px',
});
</script>
<style scoped lang="less">
.bubble-container {
  .avatar {
    width: 31px;
    height: 40px;
    border-radius: 50%;
  }

  .message {
    max-width: 215px;
    padding: 8px 10px;
    border-radius: 5px;
    font-size: 13px;
    word-wrap: break-word;
    color: #4a7ae0;
    font-weight: 500;
    position: relative;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    background-color: #d6e2fd;
    text-align: left;
  }

  .arrow {
    width: 9px;
    height: 8px;
    transform: rotate(45deg); /* 旋转45度形成三角形 */
    top: 14px;
    background-color: #d6e2fd;
  }

  .close {
    width: 13px;
    height: 13px;
    position: absolute;
    top: -14px;
    right: 0px;
  }

  .left {
    display: flex;
    position: fixed;
    left: 12px;

    .avatar {
      margin-right: 7px;
    }
    /* 箭头的样式 */
    .arrow {
      position: absolute;
      left: -4px; /* 箭头靠近气泡 */
    }
  }
  .right {
    display: flex;
    position: fixed;
    right: 12px;
    .avatar {
      margin-left: 7px;
    }
    .arrow {
      position: absolute;
      right: -4px; /* 箭头靠近气泡 */
    }
  }
}
</style>
