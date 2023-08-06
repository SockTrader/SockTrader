import { subsetlin } from './subsetlin';

describe('subsetlin', () => {
  it('subsetlin', () => {
    const c = [5, 6, 3];
    expect(subsetlin(c, [0, 1])).toEqual([5, 6]);
  });
});
