import { Mode } from '../performance/annualReturn';
import { annualAdjustedSharpeRatio } from './annualAdjustedSharpeRatio';

describe('annualAdjustedSharpeRatio', () => {
  it('annualAdjustedSharpeRatio', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(annualAdjustedSharpeRatio(x, 0.02, 12, Mode.geometric)).toEqual(
      3.3767236091658313
    );
  });
});
