import { rdivide } from './rdivide';

describe('rdivide', () => {
  it('rdivide', () => {
    expect(rdivide([5, 6, 7], [-1, -2, -3])).toEqual([
      -5, -3, -2.3333333333333335,
    ]);
    expect(rdivide([5, 6, 7], 2)).toEqual([2.5, 3, 3.5]);
  });
});
