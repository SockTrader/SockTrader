import { cumprod } from './cumprod';

describe('cumprod', () => {
  it('cumprod', () => {
    const x = [5, 6, 3];
    expect(cumprod(x)).toEqual([5, 30, 90]);
  });
});
