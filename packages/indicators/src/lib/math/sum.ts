/**
 * @method sum
 * @summary Sum of array elements
 * @description Sum of array elements
 *
 * @param  {array} x array of values
 * @return {number}
 *
 * @example
 * sum([5,6,3]);
 * // 14
 */
export function sum(x: number[]) {
  return x.reduce((prev: number, current: number) => prev + current, 0);
}
