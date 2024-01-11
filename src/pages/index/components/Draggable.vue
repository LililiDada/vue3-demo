<template>
  <div>
    <draggable
      class="list-group"
      :disabled="false"
      :list="allArray"
      :component-data="{
        name: !drag ? 'flip-list' : null,
      }"
      @start="drag = true"
      @end="drag = false"
      itemKey="name"
    >
      <template #item="{ element }">
        <div>{{ element.name }}</div>
      </template>
    </draggable>
    <div @click="submit">点击我</div>
    <div class="btn-invite"></div>
    <van-popover v-model:show="showPopover" placement="bottom-end">
      <div class="fail-desc">测试看看是不是你，是不是你啊？到底是不是你？</div>
      <template #reference>
        <van-icon name="chat-o" />
      </template>
    </van-popover>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable';
import { onMounted, ref, type TeleportProps, type PropType } from 'vue';
import { storeToRefs } from 'pinia';
import useArrayStore from '@/store/array';
const arrayStore = useArrayStore();
const { allArray } = storeToRefs(arrayStore);

onMounted(() => {
  arrayStore.updateHomeArray();
  teleportSelector.value = true;
});

const showPopover = ref(false);
const teleportSelector = ref(false);

const dragOptions = {
  animation: 200,
  group: 'description',
  ghostClass: 'ghost',
};
const drag = ref<boolean>(false);
const onMoveCallback = (val: any) => {
  console.log('拖动前的索引 :' + val.moved.newIndex);
  console.log('拖动后的索引 :' + val.moved.oldIndex);
};

const getdata = (val: any) => {
  console.log(val.draggedContext.element.id);
};

const submit = () => {
  console.log(allArray);
};
</script>
<style scoped lang="less">
.list-group {
  display: flex;

  div {
    margin-left: 5px;
  }
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  background: #646cffaa;
  opacity: 0.5;
}

.fail-desc {
  color: blueviolet;
}
</style>
