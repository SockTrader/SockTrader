import { drawdown } from './drawdown';

describe('drawdown', () => {
  it('drawdown', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(drawdown(x)).toEqual({
      dd: [0, 0, 0, 0.00900000000000004, 0, 0, 0, 0, 0.013999999999999995, 0],
      ddrecov: [0, 0, 0, 4, 0, 0, 0, 0, 9, 0],
      maxdd: 0.013999999999999995,
      maxddrecov: [8, 9],
    });
  });
});
