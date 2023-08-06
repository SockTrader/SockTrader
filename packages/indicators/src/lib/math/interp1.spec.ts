import { interp1 } from './interp1';

describe('interp1', () => {
  it('interp1', () => {
    const x = [1, 2, 3, 4, 5, 6];
    const y = [2, 4, 6, 8, 10, 12];
    const xnew = [2, 4, 6];

    expect(interp1(x, y, xnew)).toEqual([4, 8, 12]);
  });
});
