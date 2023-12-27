// math.test.js
function sum(a, b) {
  return a + b;
}

// 创建一个测试套件，用于测试 math.js 中的函数
describe('Math functions', () => {
  // 定义一个测试用例，验证 sum 函数的结果是否正确
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
});

// 创建一个测试套件，用于测试设置和清理
describe('Setup and teardown', () => {
  let num;

  // 在每个测试用例执行前执行，用于设置 num 的初始值
  beforeEach(() => {
    num = 0;
  });

  // 定义一个测试用例，验证 beforeEach 是否成功设置了 num 的初始值
  test('beforeEach sets num to 0', () => {
    expect(num).toBe(0);
  });

  // 定义一个测试用例，验证 num 是否仍然为 0
  test('num is still 0 in the second test', () => {
    expect(num).toBe(0);
  });
});

// 创建一个测试套件，用于测试模拟函数
describe('Mock functions', () => {
  const mockFn = jest.fn();

  // 定义一个测试用例，验证模拟函数是否被调用
  test('mock function is called', () => {
    mockFn();
    expect(mockFn).toHaveBeenCalled();
  });

  // 定义一个测试用例，验证模拟函数是否被特定参数调用
  test('mock function is called with specific arguments', () => {
    mockFn('hello', 'world');
    expect(mockFn).toHaveBeenCalledWith('hello', 'world');
  });
});
