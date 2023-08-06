import { sqrt } from './sqrt';

describe('sqrt', () => {
  it('sqrt', () => {
    expect(sqrt(6)).toEqual(2.449489742783178);
    expect(sqrt([5, 6, 3])).toEqual([
      2.23606797749979, 2.449489742783178, 1.7320508075688772,
    ]);
  });
});
