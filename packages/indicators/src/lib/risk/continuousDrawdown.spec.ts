import { continuousDrawdown } from './continuousDrawdown';

describe('continuousDrawdown', () => {
  it('continuousDrawdown', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(continuousDrawdown(x)).toEqual([
      0.009000000000000008, 0.014000000000000012,
    ]);
  });
});
