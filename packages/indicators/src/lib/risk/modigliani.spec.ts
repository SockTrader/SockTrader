import { modigliani } from './modigliani';

describe('modigliani', () => {
  it('modigliani', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    const y = [
      -0.005, 0.081, 0.04, -0.037, -0.061, 0.058, -0.049, -0.021, 0.062, 0.058,
    ];
    expect(modigliani(x, y)).toEqual(0.040694064858387835);
  });
});
