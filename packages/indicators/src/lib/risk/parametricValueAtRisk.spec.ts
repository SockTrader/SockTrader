import { parametricValueAtRisk } from './parametricValueAtRisk';

describe('parametricValueAtRisk', () => {
  it('parametricValueAtRisk', () => {
    expect(parametricValueAtRisk(0, 1)).toEqual(1.6448536127562643);
    expect(parametricValueAtRisk([0, 0, 0], [1, 2, 3])).toEqual([
      1.6448536127562643, 3.2897072255125286, 4.934560838268792,
    ]);
  });

  it('should throw', () => {
    expect(() => parametricValueAtRisk([0, 0, 0], 1 as never)).toThrow();
  });
});
