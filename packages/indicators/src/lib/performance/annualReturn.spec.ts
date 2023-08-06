import { Mode, annualReturn } from './annualReturn';

describe('annualReturn', () => {
  it('annualReturn', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(annualReturn(x, 12)).toEqual(0.2338146820656939);
    expect(annualReturn(x, 12, Mode.simple)).toEqual(0.2148);
  });

  it('should throw when given invalid mode', () => {
    expect(() => {
      const x = [
        0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
      ];
      annualReturn(x, 12, 'invalid' as never);
    }).toThrow();
  });
});
