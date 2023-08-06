import { Mode, rateOfReturn } from './rateOfReturn';

describe('rateOfReturn', () => {
  it('rateOfReturn', () => {
    expect(
      rateOfReturn([
        0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
      ])
    ).toEqual(0.18779277315203946);
    expect(
      rateOfReturn([100, 101, 99, 98, 97, 102, 103, 104], Mode.cumulative)
    ).toEqual(0.040000000000000036);
  });
});
