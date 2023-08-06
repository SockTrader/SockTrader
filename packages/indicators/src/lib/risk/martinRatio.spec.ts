import { martinRatio } from './martinRatio';

describe('martinRatio', () => {
  it('martinRatio', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(martinRatio(x, 0, 12)).toEqual(44.42545597931942);
  });
});
