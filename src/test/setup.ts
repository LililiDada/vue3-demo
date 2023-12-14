/// <reference types="vitest/globals" />
import { JSDOM } from 'jsdom';
import { url } from '../../constant';
export class DOM {
  private dom;
  constructor(
    option: {
      url?: string;
    } = {},
  ) {
    this.dom = new JSDOM(`<div></div>`, {
      url: option?.url || 'http://baidu.com',
    });

    this.setGlobal();
  }

  private setGlobal() {
    vi.stubGlobal('location', this.dom.window.location);
    vi.stubGlobal('navigator', this.dom.window.navigator);
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
