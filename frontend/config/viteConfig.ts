import path from 'path';
import { readdirSync } from 'fs';

interface IPage {
  name: string;
  path?: string;
  template?: string;
}

export const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * 自动扫描 src/pages/ 下的多页面入口目录，返回页面列表。
 *
 * 扫描规则：
 *   - 只看目录，跳过文件
 *   - 排除 ._ 开头的目录（如 .git、_common）
 *   - 目录内必须包含 .html 文件才算有效页面
 *
 * 兜底：扫描不到任何页面时，默认返回 index（保证至少有一个入口）。
 *
 * PAGES 是 readPages 的导出实例，三个输出函数都基于它生成。
 *
 * @returns 示例（假设 pages 下有 index 和 fundmarket 两个目录）
 *   [
 *     { name: 'fundmarket', path: 'pages/fundmarket' },
 *     { name: 'index',      path: 'pages/index' }
 *   ]
 */
const readPages = (srcDir: string): IPage[] => {
  const pagesDir = path.resolve(srcDir, 'pages');
  let pages: IPage[] = readdirSync(pagesDir, { withFileTypes: true })
    .filter((o) => o.isDirectory() && !/^[._]/.test(o.name))
    .filter((o) => {
      const dirPath = path.resolve(pagesDir, o.name);
      return readdirSync(dirPath).some((f) => f.endsWith('.html'));
    })
    .map((o) => ({ name: o.name, path: path.join('pages', o.name) }));

  if (!pages.length) {
    pages = [
      {
        name: 'index',
        path: '',
      },
    ];
  }

  return pages;
};

export const PAGES = readPages(path.resolve(ROOT_DIR, 'src'));

/**
 * 生成 Vite 多页面构建入口配置，供 build.rollupOptions.input 使用。
 * Vite 根据此配置把每个页面的 index.html 作为独立入口打包。
 *
 * @returns 示例
 *   {
 *     fundmarket: 'C:\\dashan\\vue3-demo\\frontend\\src\\pages\\fundmarket\\index.html',
 *     index:      'C:\\dashan\\vue3-demo\\frontend\\src\\pages\\index\\index.html'
 *   }
 */
export const getEntryPath = () => {
  return PAGES.reduce<Record<string, string>>((page, { name }) => {
    page[name] = path.resolve(ROOT_DIR, `src/pages/${name}/index.html`);
    return page;
  }, {});
};

/**
 * 生成 createHtmlPlugin 的 pages 配置，决定开发时每个入口
 * 的 HTML 模板路径、入口 JS 文件、以及输出文件名。
 *
 * @returns 示例
 *   [
 *     { entry: 'main.ts', filename: 'fundmarket.html', template: 'src/pages/fundmarket/index.html', injectOptions: {} },
 *     { entry: 'main.ts', filename: 'index.html',      template: 'src/pages/index/index.html',      injectOptions: {} }
 *   ]
 */
export const getPagesConfig = () => {
  return PAGES.map(({ name }) => ({
    entry: 'main.ts',
    filename: name === 'index' ? 'index.html' : `${name}.html`,
    template: `src/pages/${name}/index.html`,
    injectOptions: {},
  }));
};

/**
 * 生成短路径 → 真实模板路径的映射表，供 shortUrlPlugin 使用。
 *
 * 背景：createHtmlPlugin 内部注册了 connect-history-api-fallback
 * 中间件，它有一个 catch-all 规则（new RegExp('^/*')），会把
 * /fundmarket 等短路径拦截并重定向到首页模板。shortUrlPlugin
 * 利用本映射，在 history-fallback 之前找到正确的模板并响应。
 *
 * 首页映射 / 和 /index 两个短路径，非首页映射 /{name}。
 *
 * @returns 示例
 *   {
 *     '/':          '/src/pages/index/index.html',
 *     '/index':     '/src/pages/index/index.html',
 *     '/fundmarket': '/src/pages/fundmarket/index.html'
 *   }
 */
export const getPageShortUrls = (): Record<string, string> => {
  return PAGES.reduce<Record<string, string>>((map, { name }) => {
    if (name === 'index') {
      map['/'] = `/src/pages/index/index.html`;
      map['/index'] = `/src/pages/index/index.html`;
    } else {
      map[`/${name}`] = `/src/pages/${name}/index.html`;
    }
    return map;
  }, {});
};
