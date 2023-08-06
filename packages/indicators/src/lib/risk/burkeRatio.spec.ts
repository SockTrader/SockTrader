import { Mode, burkeRatio } from './burkeRatio';

describe('burkeRatio', () => {
  it('burkeRatio', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(burkeRatio(x, 0, 12)).toEqual(14.048562698619559);
    expect(burkeRatio(x, 0, 12, Mode.modified)).toEqual(44.42545597931944);
  });
});
