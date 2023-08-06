import { trackingError } from './trackingError';

describe('trackingError', () => {
  it('trackingError', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    const y = [
      0.04, -0.022, 0.043, 0.028, -0.078, -0.011, 0.033, -0.049, 0.09, 0.087,
    ];
    expect(trackingError(x, y)).toEqual(0.06843618276256436);
  });
});
