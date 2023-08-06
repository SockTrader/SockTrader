import { isNumber } from '../utils';

/**
 * @method abs
 * @summary Absolute value
 * @description Absolute value
 *
 * @param  {number|array} x number or array of values
 * @return {number|array}
 *
 * @example
 * abs(-0.5);
 * // -1
 *
 * abs([0.1,-0.5]);
 * // [0.1, 0.5]
 *
 * abs([[5,-2],[-3,4]]);
 * // [[5, 2], [3, 4]]
 */
function abs(x: number): number;
function abs(x: number[]): number[];
function abs(x: number | number[]): number | number[] {
  if (isNumber(x)) return Math.abs(x);

  return x.map((x) => Math.abs(x));
}

export { abs };
