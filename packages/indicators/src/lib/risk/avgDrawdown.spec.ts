import { avgDrawdown } from './avgDrawdown';

describe('avgDrawdown', () => {
  it('avgDrawdown', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(avgDrawdown(x)).toEqual(0.01150000000000001);
    expect(avgDrawdown(x, 1)).toEqual(0.014000000000000012);
  });
});
