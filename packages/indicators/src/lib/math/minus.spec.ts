import { minus } from './minus';

describe('minus', () => {
  it('minus', () => {
    expect(minus([5, 6, 4], [3, -1, 0])).toEqual([2, 7, 4]);
    expect(minus([5, 6, 4], 10)).toEqual([-5, -4, -6]);
  });
});
