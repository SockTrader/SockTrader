/**
 * @method cumprod
 * @summary Cumulative product of array elements
 * @description Cumulative product of array elements
 *
 * @param  {array} x array of values
 * @return {array}
 *
 * @example
 * cumprod([5,6,3]);
 * // [ 5, 30, 90 ]
 *
 * cumprod([[5,6,5],[7,8,-1]]);
 * // [ [ 5, 6, 5 ], [ 35, 48, -5 ] ]
 *
 * cumprod([[5,6,5],[7,8,-1]],0);
 * // [ [ 5, 30, 150 ], [ 7, 56, -56 ] ]
 */
export function cumprod(x: number[]): number[] {
  return x.slice(1).reduce(
    (prev, current, idx) => {
      return [...prev, prev[idx] * current];
    },
    [x[0]]
  );
}
