import { upsidePotential } from './upsidePotential';

describe('upsidePotential', () => {
  it('upsidePotential', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(upsidePotential(x, 0.1 / 100)).toEqual(0.0194);
  });
});
