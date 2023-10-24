import { defineStore } from 'pinia';
import { reactive, computed, ref } from 'vue';

const useArrayStore = defineStore('arrayStore', () => {
  const homeArray = reactive<{ name: string }[]>([]);
  const allArray = reactive<{ name: string; display?: string }[]>([]);
  const showControl = ref<boolean>(false);
  const updateHomeArray = () => {
    const arr = [
      {
        name: '属性1',
      },
      {
        name: '属性2',
      },
    ];
    const allArr = [
      {
        name: '属性1',
      },
      {
        name: '属性2',
      },
      {
        name: '属性3',
      },
      {
        name: '属性4',
      },
      {
        name: '属性5',
      },
      {
        name: '属性6',
        display: 'showControl',
      },
    ];
    homeArray.push(...arr);
    allArray.push(...allArr);
  };
  const addArray = (item: any) => {
    console.log(item, '======addArray');
    homeArray.push(item);
  };

  const delArray = (item: any) => {
    const index = homeArray.findIndex((iten) => iten.name === item.name);
    homeArray.splice(index, 1);
  };

  const isHeader = computed(() => (item: any) => {
    const index = homeArray.findIndex((iten) => iten.name === item.name);
    console.log('=====isHeader', item, index > -1 ? true : false);
    return index > -1 ? true : false;
  });
  return {
    homeArray,
    allArray,
    showControl,
    updateHomeArray,
    addArray,
    delArray,
    isHeader,
  };
});

export default useArrayStore;
