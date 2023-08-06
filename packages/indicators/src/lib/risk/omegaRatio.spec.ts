import { omegaRatio } from './omegaRatio';

describe('omegaRatio', () => {
  it('omegaRatio', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(omegaRatio(x)).toEqual(8.782608695652174);
  });
});
