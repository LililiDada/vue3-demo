import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { resolve } from 'path';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from '@vant/auto-import-resolver';
import { getEntryPath } from './config/viteConfig';
// https://vitejs.dev/config/
export default defineConfig(({ mode }): any => {
  const env = loadEnv(mode, process.cwd(), '');
  const isBuild = env.VITE_APP_ENV === 'production';
  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    plugins: [
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
        pages: [
          {
            entry: '/src/pages/index/main.ts',
            filename: 'index.html',
            template: `${isBuild ? '/' : ''}src/pages/index/index.html`,
            injectOptions: {
              data: {
                injectScript: '<script src="./mian.ts"></script>',
              },
            },
          },
        ],
      }),
    ],
    build: {
      rollupOptions: {
        input: getEntryPath(),
      },
    },
  };
});
