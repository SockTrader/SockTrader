import { log } from './log';

describe('log', () => {
  it('log', () => {
    expect(log(6)).toEqual(1.791759469228055);
    expect(log([5, 6, 3])).toEqual([
      1.6094379124341003, 1.791759469228055, 1.0986122886681096,
    ]);
  });
});
