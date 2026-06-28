const person = {
  isActive: true,
  age: 32,
};

// 在开始运行当前上下文中的所有测试之前调用一次
beforeAll(() => {
  vi.stubEnv('NODE_ENV', 'production');
});
// 在当前上下文中所有测试运行完毕后调用一次
afterAll(() => {
  vi.unstubAllEnvs();
});

describe('person', () => {
  test('person is defined', () => {
    expect(person).toBeDefined();
  });

  test('is active', () => {
    expect(person.isActive).toBeTruthy();
  });

  test('age limit', () => {
    expect(person.age).toBeLessThanOrEqual(32);
  });
});

function add(a: number, b: number) {
  return a + b;
}

describe('test add', () => {
  test('successful', () => {
    expect(add(1, 1)).toEqual(2);
  });

  test('fail', () => {
    // expect(add(1, 1)).toEqual(1);
  });
});
