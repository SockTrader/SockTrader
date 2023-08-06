import { skewness } from './skewness';

describe('skewness', () => {
  it('skewness', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(skewness(x)).toEqual(0.6174813132481229);
  });
});
