import { times } from './times';

describe('times', () => {
  it('times', () => {
    expect(times([5, 6, 4], [3, -1, 0])).toEqual([15, -6, 0]);
    expect(times([5, 6, 4], 10)).toEqual([50, 60, 40]);
  });
});
