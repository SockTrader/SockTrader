import { timeWeightedReturn } from './timeWeightedReturn';

describe('timeWeightedReturn', () => {
  it('timeWeightedReturn', () => {
    const mv = [250000, 255000, 257000, 288000, 293000, 285000];
    const cf = [0, 0, 25000, 0, -10000, 0];

    expect(timeWeightedReturn(mv, cf)).toEqual(0.07564769566198049);
  });
});
