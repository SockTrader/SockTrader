import { mdietz } from './mdietz';

describe('mdietz', () => {
  it('as number', () => {
    const ev = 104.4;
    const bv = 74.2;
    const cf = 37.1;
    const cfd = 14;
    const cd = 31;

    expect(mdietz(ev, bv, cf, cfd, cd)).toEqual(-0.07298099559862156);
  });

  it('as array', () => {
    const ev = 1200;
    const bv = 1000;
    const cf = [10, 50, 35, 20];
    const cfd = [15, 38, 46, 79];
    const cd = 90;

    expect(mdietz(ev, bv, cf, cfd, cd)).toEqual(0.0804331826306382);
  });

  it('should throw if cd < 0', () => {
    const ev = 1200;
    const bv = 1000;
    const cf = [10, 50, 35, 20];
    const cfd = [15, 38, 46, 79];
    const cd = 0;

    expect(() => mdietz(ev, bv, cf, cfd, cd)).toThrow();
  });

  it('should throw if cfd < 0', () => {
    const ev = 1200;
    const bv = 1000;
    const cf = [10, 50, 35, 20];
    const cfd = [15, -38, 46, 79];
    const cd = 90;

    expect(() => mdietz(ev, bv, cf, cfd, cd)).toThrow();
  });
});
