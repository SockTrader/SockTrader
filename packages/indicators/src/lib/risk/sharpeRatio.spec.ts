import { sharpeRatio } from './sharpeRatio';

describe('sharpeRatio', () => {
  it('sharpeRatio', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(sharpeRatio(x, 0.02 / 12)).toEqual(0.6987943426529188);
  });
});
