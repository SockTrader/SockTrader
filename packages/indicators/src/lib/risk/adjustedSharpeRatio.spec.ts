import { adjustedSharpeRatio } from './adjustedSharpeRatio';

describe('adjustedSharpeRatio', () => {
  it('adjustedSharpeRatio', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(adjustedSharpeRatio(x, 0.02 / 12)).toEqual(0.7481337144481773);
  });
});
