import { percpos } from './percpos';

describe('percpos', () => {
  it('percpos', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(percpos(x)).toEqual(0.8);
  });
});
