// Basic test to verify Jest setup
describe('Basic Test Suite', () => {
  test('should run basic arithmetic', () => {
    expect(1 + 1).toBe(2);
    expect(2 * 3).toBe(6);
  });

  test('should handle strings', () => {
    expect('hello world').toContain('world');
    expect('test'.toUpperCase()).toBe('TEST');
  });

  test('should work with arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  test('should work with objects', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj).toHaveProperty('name');
    expect(obj.value).toBe(42);
  });
});
