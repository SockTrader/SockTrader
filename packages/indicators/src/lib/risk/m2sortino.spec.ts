import { m2sortino } from './m2sortino';

describe('m2sortino', () => {
  it('m2sortino', () => {
    const x = [0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039];
    const y = [-0.005, 0.081, 0.04, -0.037, -0.061, 0.058, -0.049, -0.021, 0.062, 0.058];
    expect(m2sortino(x, y, 0, 0, 12)).toEqual(0.504144074388577);
  });
});
