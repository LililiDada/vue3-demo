import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import * as echarts from 'echarts';

const pinia = createPinia();
const app = createApp(App);


app.config.globalProperties.$echarts = echarts

app.use(router).use(pinia).mount('#app');


