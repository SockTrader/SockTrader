import { erfcinv } from './erfcinv';

describe('erfcinv', () => {
  it('erfcinv', () => {
    expect(erfcinv(1.5)).toEqual(-0.476936236121904);
    expect(erfcinv(-1)).toEqual(Infinity);
    expect(erfcinv(2)).toEqual(-Infinity);
  });
});
