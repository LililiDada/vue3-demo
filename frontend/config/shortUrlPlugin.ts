import { Plugin } from 'vite';
import { getPageShortUrls } from './viteConfig';
import fs from 'fs';
import path from 'path';

/**
 * 短路径插件（short-url）
 *
 * ── 解决的问题 ──
 *
 * 但开发时直接访问 http://localhost:5173/fundmarket.html 会被 createHtmlPlugin 的
 * connect-history-api-fallback 中间件拦截。它的 catch-all 规则（new RegExp('^/*')）
 * 会匹配当前目录下的对应路径。因为根目录下没有对应的 fundmarket.html 文件，
 * history-fallback 就把请求重定向到首页模板了 —— 这是它的设计初衷：
 * SPA 场景下找不到真实文件时统一返回 index.html，让前端路由接管。
 * 但我们的项目是多页面入口，每个页面有自己独立的 index.html。
 *
 * 正常访问流程（无本插件时）：
 *   /fundmarket → 根目录没有 fundmarket.html → history-fallback catch-all 拦截 → 重定向首页 → 浏览器显示首页
 *
 * 插件做了什么：
 *   1. 在中间件栈最前面插入拦截器，抢在 catch-all 规则之前处理请求
 *   2. 匹配 /fundmarket 或 /fundmarket.html，找到对应的真实模板 src/pages/fundmarket/index.html
 *   3. 读取模板内容，把里面的 ./main.ts 替换为 /src/pages/fundmarket/main.ts
 *      原因：Vite 的 devHtmlHook 只对 /index.html 路径做 ./xxx 相对路径改写，
 *      其他路径下的 ./main.ts 不会被处理。如果直接用原始 html 响应，
 *      浏览器从 /fundmarket 解析 ./main.ts 会得到 /main.ts（不存在），导致 404。
 *   4. 直接响应 html，不走后续中间件
 *
 * 为什么用 stack.unshift 而不是 server.middlewares.use：
 *   server.middlewares.use 往末尾追加，而 createHtmlPlugin 的 history-fallback 在
 *   configureServer 阶段已添加到栈中。history-fallback 的 catch-all 规则不管访问
 *   什么不存在的路径都会被匹配到，插入到它前面才能抢到原始短路径。
 */
export function shortUrlPlugin(): Plugin {
  return {
    name: 'short-url',
    configureServer(server) {
      const shortMap = getPageShortUrls();
      const root = server.config.root;
      const middleware = async (req: any, res: any, next: any) => {
        if (!req.url) {
          next();
          return;
        }
        // 去掉 query string 和 hash，只保留路径部分
        const urlPath = req.url.split('?')[0]?.split('#')[0];
        if (!urlPath) {
          next();
          return;
        }
        // 规范化路径：去掉末尾斜杠（/ 保留为 /）
        const normalized = urlPath.replace(/\/$/, '') || '/';
        // 去掉可选的 .html 后缀，使 /fundmarket 和 /fundmarket.html 都能匹配
        const shortKey = normalized.replace(/\.html$/, '');
        const target = shortMap[shortKey];
        if (!target) {
          next();
          return;
        }
        // target 示例：/src/pages/fundmarket/index.html
        // 拼接为完整文件路径
        const filePath = path.join(root, target);
        let html: string;
        try {
          html = fs.readFileSync(filePath, 'utf-8');
        } catch {
          next();
          return;
        }
        // Vite 的 devHtmlHook 在 processNodeUrl 里有一段判断：
        //   else if (url[0] === '.' && originalUrl && originalUrl !== '/' && htmlPath === '/index.html')
        // 只有 htmlPath === '/index.html' 时才处理 ./xxx 这类相对路径。
        // 我们的 target 是 /src/pages/fundmarket/index.html，不等于 /index.html，
        // 所以 ./main.ts 不会被 Vite 改写。如果直接返回原始 html，浏览器从 /fundmarket 加载页面时，
        // 会把 ./main.ts 解析为 /main.ts（不存在），导致 404。
        // 解决方案：返回前手动把 ./xxx 替换为 /src/pages/<name>/xxx。
        const dir = path.posix.dirname(target);
        html = html.replace(
          /(src|href)=(["'])\.\/([^"']+)\2/g,
          (match, attr, quote, file) => {
            return `${attr}=${quote}${dir}/${file}${quote}`;
          },
        );
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
      };
      // 插入到中间件栈最前面，抢在 createHtmlPlugin 的 history-fallback 之前。
      //
      // history-fallback 有一条 catch-all 规则（new RegExp('^/*')），
      // 不管访问 /fundmarket 还是 /其他不存在的路径，都会被它拦截并重定向到首页。
      // 如果我们的插件放在它后面（server.middlewares.use），
      // 拿到的是已经被改写过的 URL，短路径映射就匹配不上了。
      server.middlewares.stack.unshift({ route: '', handle: middleware });
    },
  };
}
