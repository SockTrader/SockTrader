import { painRatio } from './painRatio';

describe('painRatio', () => {
  it('painRatio', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(painRatio(x, 0, 12)).toEqual(101.04495520047377);
  });
});
