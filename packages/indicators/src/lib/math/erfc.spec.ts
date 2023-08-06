import { erfc } from './erfc';

describe('erfc', () => {
  it('erfc', () => {
    expect(erfc(0.5)).toEqual(0.47950009227675744);
    expect(erfc(-0.5)).toEqual(1.5204999077232426);
  });
});
