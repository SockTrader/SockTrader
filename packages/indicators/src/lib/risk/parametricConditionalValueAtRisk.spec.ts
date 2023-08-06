import { mean, std } from '../statistics';
import { parametricConditionalValueAtRisk } from './parametricConditionalValueAtRisk';

describe('parametricConditionalValueAtRisk', () => {
  it('as single value', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(parametricConditionalValueAtRisk(mean(x), std(x))).toEqual(
      0.030017825479120894
    );
  });

  it('as array', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    const y = [
      -0.005, 0.081, 0.04, -0.037, -0.061, 0.058, -0.049, -0.021, 0.062, 0.058,
    ];
    expect(parametricConditionalValueAtRisk(x, y)).toEqual([
      -0.013313564278348945, 0.1410797413092529, 0.06750851422679155,
      -0.06732037565978219, -0.13982548419585714, 0.09563734562884776,
      -0.11607292992781966, -0.10931696996906558, 0.14188819705152692,
      0.08063734562884778,
    ]);
  });

  it('should throw', () => {
    expect(() =>
      parametricConditionalValueAtRisk([0, 0, 0], 1 as never)
    ).toThrow();
  });
});
