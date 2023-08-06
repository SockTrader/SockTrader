import { activeReturn } from './activeReturn';

describe('activeReturn', () => {
  it('activeReturn', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    const z = [
      0.04, -0.022, 0.043, 0.028, -0.078, -0.011, 0.033, -0.049, 0.09, 0.087,
    ];
    expect(activeReturn(x, z, 12)).toEqual(0.041978811047168385);
  });
});
