import { prod } from './prod';

describe('prod', () => {
  it('prod', () => {
    expect(prod([5, 6, 3])).toEqual(90);
  });
});
