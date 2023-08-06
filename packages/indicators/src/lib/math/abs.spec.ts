import { abs } from './abs';

describe('abs', () => {
  it('abs', () => {
    expect(abs(-0.5)).toEqual(0.5);
    expect(abs([0.1, -0.5])).toEqual([0.1, 0.5]);
  });
});
