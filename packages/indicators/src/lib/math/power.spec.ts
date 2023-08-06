import { power } from './power';

describe('power', () => {
  it('power', () => {
    const x = [5, 6, 3];
    expect(power(x, 5)).toEqual([3125, 7776, 243]);
    expect(power(x, x)).toEqual([3125, 46656, 27]);
  });
});
