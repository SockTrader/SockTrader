import { ulcerIndex } from './ulcerIndex';

describe('ulcerIndex', () => {
  it('ulcerIndex', () => {
    const x = [
      0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039,
    ];
    expect(ulcerIndex(x)).toEqual(0.005263078946776312);
  });
});
