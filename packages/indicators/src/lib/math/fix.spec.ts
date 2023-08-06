import { fix } from './fix';

describe('fix', () => {
  it('fix', () => {
    expect(fix(3.78)).toEqual(3);
    expect(fix([4.51, -1.4])).toEqual([4, -1]);
  });
});
