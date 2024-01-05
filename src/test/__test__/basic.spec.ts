import { DOM } from '../setup';

describe('测试', () => {
  test('should work as expected', () => {
    new DOM({ url: 'http://xxxxx.com' });
    expect(Math.sqrt(4)).toBe(2);
  });

  test('should work as expected2', () => {
    expect(Math.sqrt(4)).toBe(2);
  });
});
