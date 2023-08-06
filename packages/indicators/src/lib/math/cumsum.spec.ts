import { cumsum } from './cumsum';

describe('cumsum', () => {
  it('cumsum', () => {
    const x = [5, 6, 3];
    expect(cumsum(x)).toEqual([5, 11, 14]);
  });
});
