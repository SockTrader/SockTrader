import { sum } from './sum';

describe('sum', () => {
  it('sum', () => {
    expect(sum([5, 6, 3])).toEqual(14);
  });
});
