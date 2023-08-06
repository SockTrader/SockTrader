import { compoundAnnualGrowthRate } from './compoundAnnualGrowthRate';

describe('compoundAnnualGrowthRate', () => {
  it('compoundAnnualGrowthRate', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(compoundAnnualGrowthRate(x, x.length / 12)).toEqual(
      0.22938756017127182
    );
  });
});
