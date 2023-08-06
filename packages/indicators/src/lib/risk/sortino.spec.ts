import { sortino } from './sortino';

describe('sortino', () => {
  it('sortino', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(sortino(x, 0.02 / 12)).toEqual(3.0843795993743215);
  });
});
