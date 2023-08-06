import { histvar } from './histvar';

describe('histvar', () => {
  it('histvar', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(histvar(x)).toEqual(0.013999999999999999);
  });
});
