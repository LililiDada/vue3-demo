import {RouteRecordRaw} from 'vue-router';

const DemoIndex = () => import(/*  */ '@/pages/index/views/demo/index.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/demo',
    name: 'demo',
    component: DemoIndex,
    children:[]
  }
];

export default routes;