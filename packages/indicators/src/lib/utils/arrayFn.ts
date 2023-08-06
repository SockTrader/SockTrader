import { isNumber } from '../utils';

/**
 * @method arrayFn
 * @summary Array function
 * @description Apply function on each value of the array
 *
 * @param {number|array} x array of values
 * @param {Function} fn function to be called for each value
 * @return {number|array}
 *
 * @example
 * arrayFn(3.78, (x) => x);
 * // 3.78
 *
 * arrayFn([4.51,-1.4], (x) => x);
 * // [ 4.51,-1.4 ]
 */
function arrayFn(x: number, fn: (x: number) => number): number;
function arrayFn(x: number[], fn: (x: number) => number): number[];
function arrayFn(
  x: number | number[],
  fn: (x: number) => number
): number | number[] {
  return isNumber(x) ? fn(x) : x.map(fn);
}

export { arrayFn };
