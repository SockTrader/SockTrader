import { prctile } from './prctile';

describe('prctile', () => {
  it('prctile', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(prctile(x, 5)).toEqual(-0.014);
    expect(prctile(x, 33)).toEqual(0.011799999999999995);
  });
});
