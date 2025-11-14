<script setup lang="ts"></script>

<template>
  <div class="container">
    <!-- 背景图片 -->
    <!-- <div class="background-image"></div> -->

    <!-- 父元素 -->
    <div class="parent">
      <!-- 子元素 -->
      <div class="child">
        父元素的子内容父元素的子内容父元素的子内容父元素的子内容父元素的子内容父元素的子内容
      </div>
    </div>

    <!-- 父元素外的图片 -->
    <img src="@images/model-avatar.png" alt="外部图片" class="external-image" />
  </div>
</template>

<style scoped>
/* 容器：强制创建一个层叠上下文 */
.container {
  position: relative;
  z-index: 0; /* 基础层叠上下文 */
  width: 100%;
  height: auto;
}

/* 背景图片 */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('@images/score-lg.png') no-repeat center/cover;
  z-index: 0; /* 背景图片层级最低 */
}

/* 父元素样式 */
.parent {
  position: relative;
  z-index: 2; /* 父元素的层叠上下文 */
  width: 100%;
  background: radial-gradient(circle at top right, red, transparent);
  /* background: linear-gradient(to bottom right, red 60%, transparent 90%); */
}

/* 子元素样式 */
.child {
  position: relative;
  z-index: 3; /* 子元素层级最高 */
  /* background-color: rgba(255, 255, 255, 0.8); */
  padding: 10px;
  border-radius: 5px;
}

/* 父元素外的图片 */
.external-image {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1; /* 外部图片层级介于背景图片和子元素之间 */
  width: 100px;
  height: auto;
}
</style>
