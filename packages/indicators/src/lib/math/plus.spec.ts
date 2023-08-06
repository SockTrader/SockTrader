import { plus } from './plus';

describe('plus', () => {
  it('plus', () => {
    expect(plus([5, 6, 4], [3, -1, 0])).toEqual([8, 5, 4]);
    expect(plus([5, 6, 4], 10)).toEqual([15, 16, 14]);
  });
});
