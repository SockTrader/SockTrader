import { monteCarloValueAtRisk } from './monteCarloValueAtRisk';

describe('monteCarloValueAtRisk', () => {
  it('monteCarloValueAtRisk', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    const result = monteCarloValueAtRisk(x, 0.95, 1, 0, 1, 10000);

    expect(result > 0).toEqual(true);
    expect(result < 1).toEqual(true);
  });
});
