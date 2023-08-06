/**
 * @method cumsum
 * @summary Cumulative sum of array elements
 * @description Cumulative sum of array elements
 *
 * @param  {array} x array of values
 * @return {array}
 *
 * @example
 * cumsum([5,6,3]);
 * // [5, 11, 14]
 */
export function cumsum(x: number[]): number[] {
  return x.slice(1).reduce(
    (prev, current, idx) => {
      return [...prev, prev[idx] + current];
    },
    [x[0]]
  );
}
