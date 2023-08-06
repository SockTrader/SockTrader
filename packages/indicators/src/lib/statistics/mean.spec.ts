import { mean } from './mean';

describe('mean', () => {
  it('mean', () => {
    const x = [5, 6, 3];
    expect(mean(x)).toEqual(4.666666666666667);
  });
});
