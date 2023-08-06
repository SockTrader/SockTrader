import { cumdev } from './cumdev';

describe('cumdev', () => {
  it('cumdev', () => {
    expect(cumdev([5, 6, 3])).toEqual([
      0.33333333333333304, 1.666666666666666, -8.881784197001252e-16,
    ]);
  });
});
