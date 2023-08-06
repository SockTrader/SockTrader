import { colon } from './colon';

describe('colon', () => {
  it('colon', () => {
    expect(colon(1, 10, 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(colon(10, 1, 1)).toEqual([]);
    expect(colon(-5, 5, 2)).toEqual([-5, -3, -1, 1, 3, 5]);
    expect(colon(-7, 14, 2)).toEqual([-7, -5, -3, -1, 1, 3, 5, 7, 9, 11, 13]);
  });
});
