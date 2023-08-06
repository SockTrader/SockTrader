import { kurtosis } from './kurtosis';

describe('kurtosis', () => {
  it('kurtosis', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(kurtosis(x)).toEqual(3.0375811348880486);
  });
});
