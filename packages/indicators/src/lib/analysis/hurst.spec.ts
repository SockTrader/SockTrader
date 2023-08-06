import { Variance } from '../statistics';
import { hurst } from './hurst';

describe('hurst', () => {
  it('hurst', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(hurst(x, Variance.sample)).toEqual(0.3440590389509703);
  });
});
