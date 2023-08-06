import { moment } from './moment';

describe('moment', () => {
  it('moment', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(moment(x, 3)).toEqual(0.0000066094080000000025);
    expect(moment(x, 1)).toEqual(6.938893903907229e-19);
  });
});
