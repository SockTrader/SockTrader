import { Sort, sort } from './sort';

describe('sort', () => {
  it('sort ascending', () => {
    expect(sort([0, 5, -1, 3, -4, 9, 0], Sort.ascending)).toEqual([
      -4, -1, 0, 0, 3, 5, 9,
    ]);
  });

  it('sort descending', () => {
    expect(sort([0, 5, -1, 3, -4, 9, 0], Sort.descending)).toEqual([
      9, 5, 3, 0, 0, -1, -4,
    ]);
  });
});
