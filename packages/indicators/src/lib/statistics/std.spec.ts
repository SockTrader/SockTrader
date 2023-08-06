import { std } from './std';

describe('std', () => {
  it('std', () => {
    const x = [5, 6, 3];
    expect(std(x)).toEqual(1.5275252316519465);
    expect(std(x, 0)).toEqual(1.247219128924647);
  });
});
