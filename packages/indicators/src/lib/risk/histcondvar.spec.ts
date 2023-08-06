import { histcondvar } from './histcondvar';

describe('histcondvar', () => {
  it('histcondvar', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(histcondvar(x)).toEqual(0.014);
  });
});
