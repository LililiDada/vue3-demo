import { JSDOM,ResourceLoader } from 'jsdom';
import { url } from '../../constant';

import fs from 'fs';
import path from 'path';

const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>jsdom External Script Example</title>
  </head>
  <body>
    <div id="content"></div>
  </body>
</html>
`;

export class DOM {
  private dom;
  constructor(
    option: {
      url?: string;
    } = {},
  ) {

    new ResourceLoader({
      userAgent: 'Mozixxxxx'
    })

    this.dom = new JSDOM(html, {
      url: option?.url || 'http://baidu.com',
      runScripts: 'dangerously',
      resources: 'usable',
      includeNodeLocations: true
    });

    this.evalScript();
    this.setGlobal();
  }

  private setGlobal() {
    // vi.stubGlobal('location', this.dom.window.location);
    // vi.stubGlobal('navigator', this.dom.window.navigator);
    // vi.stubGlobal('Add', this.dom.window.add);
    // vi.stubGlobal('document', this.dom.window.document);
    // 保证window下的属性和方法来源一致
    vi.stubGlobal('window',this.dom.window)
    
  }

  private evalScript() {
    const externalScriptPath = path.resolve(process.cwd(), 'public/ubt.js');
    const externalScriptCode = fs.readFileSync(externalScriptPath, 'utf-8');
    this.dom.window.eval(externalScriptCode);
  }
}

export let JsDom: any;

/**
 * 在开始运行当前上下文中的所有测试之前调用一次
 */
beforeAll(() => {
  // 构建浏览器环境
  JsDom = new DOM({ url });
});

/**
 * 在当前上下文中所有测试运行完毕后调用一次
 */
afterAll(() => {
  // 恢复global（window）初始值
  vi.unstubAllGlobals();
});
