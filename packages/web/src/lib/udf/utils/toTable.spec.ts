import { toTable } from './toTable';

describe('toTable', () => {
  it('should map array of objects to object of arrays', () => {
    const arrayOfObjects = [
      {
        a: 1,
        b: 1,
      },
      {
        a: 2,
        b: 2,
        c: 2,
      },
    ];

    expect(toTable(arrayOfObjects)).toEqual({
      a: [1, 2],
      b: [1, 2],
      c: [2],
    });
  });
});
