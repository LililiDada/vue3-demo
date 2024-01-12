import { RouteRecordRaw } from 'vue-router';

const DemoIndex = () =>
  import(/* webpackChunkName: 'DemoIndex' */ '@/pages/index/views/demo/index.vue');


const homePage = () =>
  import(/* webpackChunkName: 'homePage' */ '@/pages/index/views/demo/homePage.vue');

const checkBox = () =>
  import(/* webpackChunkName: 'checkBox' */ '@/pages/index/views/demo/checkBox.vue');

const paster = () =>
  import(/* webpackChunkName: 'checkBox' */ '@/pages/index/views/demo/paster.vue');
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
    ],
  },
];

export default routes;
