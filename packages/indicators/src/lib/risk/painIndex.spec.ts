import { painIndex } from './painIndex';

describe('painIndex', () => {
  it('painIndex', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(painIndex(x)).toEqual(0.0023000000000000034);
  });
});
