import { RouteRecordRaw } from 'vue-router';

const DemoIndex = () =>
  import(/* webpackChunkName: 'DemoIndex' */ '@/pages/index/views/demo/index.vue');


const homePage = () =>
  import(/* webpackChunkName: 'DemoIndex' */ '@/pages/index/views/demo/homePage.vue');

const checkBox = () =>
  import(/* webpackChunkName: 'DemoIndex' */ '@/pages/index/views/demo/checkBox.vue');

const paster = () =>
  import(/* webpackChunkName: 'DemoIndex' */ '@/pages/index/views/demo/paster.vue');

const chat = () =>
  import(/* webpackChunkName: 'DemoIndex' */ '@/pages/index/views/demo/chat.vue');


const shaking = () =>
  import(/* webpackChunkName: 'DemoIndex' */ '@/pages/index/views/demo/shaking.vue');



const echarts = () =>
  import(/* webpackChunkName: 'DemoIndex' */ '@/pages/index/views/demo/echarts.vue');
const routes: RouteRecordRaw[] = [
  {
    path: '/demo',
    name: 'demo',
    component: DemoIndex,
    children: [
      {
        path: 'homepage',
        name: 'homePage',
        component: homePage,
      },
      {
        path: 'checkbox',
        name: 'checkBox',
        component: checkBox,
      },
      {
        path: 'paster',
        name: 'paster',
        component: paster,
      },
      {
        path: 'chat',
        name: 'chat',
        component: chat,
      },
      {
        path: 'shaking',
        name: 'shaking',
        component: shaking,
      },
      {
        path: 'echarts',
        name: 'echarts',
        component: echarts,
      }
    ],
  },
];

export default routes;
