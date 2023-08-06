import { annualRisk } from './annualRisk';

describe('annualRisk', () => {
  it('annualRisk', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(annualRisk(x, 12)).toEqual(0.08047276972160623);
  });
});
