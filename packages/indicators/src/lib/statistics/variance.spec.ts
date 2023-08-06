import { variance } from './variance';

describe('variance', () => {
  it('variance', () => {
    const x = [5, 6, 3];
    expect(variance(x)).toEqual(2.333333333333333);
    expect(variance(x, 0)).toEqual(1.5555555555555554);
  });
});
