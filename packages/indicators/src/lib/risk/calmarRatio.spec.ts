import { calmarRatio } from './calmarRatio';

describe('calmarRatio', () => {
  it('calmarRatio', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(calmarRatio(x, 0, 12)).toEqual(16.70104871897814);
  });
});
