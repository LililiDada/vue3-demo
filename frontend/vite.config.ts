import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { resolve } from 'path';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from '@vant/auto-import-resolver';
import { getEntryPath, getPagesConfig } from './config/viteConfig';
import { shortUrlPlugin } from './config/shortUrlPlugin';
// https://vitejs.dev/config/
export default defineConfig((): any => {
  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@images': resolve(__dirname, './src/assets/images'),
      },
    },
    plugins: [
      // 必须在 createHtmlPlugin 之前注册，这样它的中间件才能插入到
      // history-fallback 前面，拦截 /fundmarket.html 等多入口不被重定向到首页
      shortUrlPlugin(),
      vue(),
      Components({
        resolvers: [VantResolver()],
      }),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: path.resolve(__dirname, 'auto-imports.d.ts'),
        eslintrc: {
          enabled: true,
        },
      }),
      createHtmlPlugin({
        minify: true,
        pages: getPagesConfig(),
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        input: getEntryPath(),
      },
    },
  };
});
