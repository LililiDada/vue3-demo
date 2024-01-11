import { RouteRecordRaw } from 'vue-router';

const DemoIndex = () =>
  import(/* DemoIndex */ '@/pages/index/views/demo/index.vue');

const checkBox = () =>
  import(/* checkBox */ '@/pages/index/views/demo/checkBox.vue');
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/demo',
    children: [
      {
        path: 'demo',
        name: 'demo',
        component: DemoIndex,
      },
      {
        path: 'checkbox',
        name: 'checkBox',
        component: checkBox,
      },
    ],
  },
];

export default routes;
