import { normpdf } from './normpdf';

describe('normpdf', () => {
  it('normpdf', () => {
    expect(normpdf(1)).toEqual(0.24197072451914337);
  });
});
