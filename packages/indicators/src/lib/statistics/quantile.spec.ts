import { quantile } from './quantile';

describe('quantile', () => {
  it('quantile', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(quantile(x, 0.25)).toEqual(0.002999999999999999);
  });
});
