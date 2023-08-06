/**
 * @method prod
 * @summary Product of array elements
 * @description Product of array elements
 *
 * @param  {array} x array of values
 * @return {number|array}
 *
 * @example
 * prod([5,6,3]);
 * // 90
 */
export function prod(x: number[]): number {
  return x.reduce((prev, current) => prev * current, 1);
}
