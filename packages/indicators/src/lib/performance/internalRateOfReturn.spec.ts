import { internalRateOfReturn } from './internalRateOfReturn';

describe('internalRateOfReturn', () => {
  it('internalRateOfReturn', () => {
    expect(internalRateOfReturn([250000, 25000, -10000, -285000])).toEqual(
      0.024712563094781776
    );
    expect(internalRateOfReturn([74.2, 37.1, -104.4], [0, 1, 2], 2)).toEqual(
      -0.07410820570460687
    );
    expect(
      internalRateOfReturn(
        [250000, 25000, -10000, -285000],
        [0, 45, 69, 90],
        90
      )
    ).toEqual(0.07692283872311291);
    expect(internalRateOfReturn([74.2, 37.1, -104.4], [0, 14, 31], 31)).toEqual(
      -0.07271456460699813
    );
  });
});
