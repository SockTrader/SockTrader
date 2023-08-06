import { arrayFn } from './arrayFn';

describe('arrayFn', () => {
  const a = (): number => arrayFn(5, (x) => x + 1);
  const b = (): number[] => arrayFn([5], (x) => x + 1);

  it('should compile with correct types', () => {
    expect(a()).toEqual(6);
    expect(b()).toEqual([6]);
  });

  it('should execute on arrays', () => {
    const x = [5, 6, 3];
    expect(arrayFn(x, (x) => x + 1)).toEqual([6, 7, 4]);
  });

  it('should execute on single values', () => {
    const x = 5;
    expect(arrayFn(x, (x) => x + 1)).toEqual(6);
  });
});
