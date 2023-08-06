import { isNumber } from '../utils';
import { arrayFn } from '../utils/arrayFn';

/**
 * @method rdivide
 * @summary Right array division X. / Y
 * @description Divides each element of X by the corresponding element of Y. Inputs X and Y
 * must have the same size
 *
 * @param  {number|array} x number or array of values
 * @param  {number|array} y number or array of values
 * @return {number|array}
 *
 * @example
 * var a = [[5,6,5],[7,8,-1]];
 * var b = [-1,-2,-3];
 * var e = [[9, 5], [6, 1]];
 * var f = [[3, 2], [5, 2]];
 *
 * rdivide(a,3);
 * // [[ 1.66667, 2, 1.66667 ], [ 2.33333, 2.66667, -0.333333 ]]
 *
 * rdivide(3,[-1,-2,-3]);
 * // [ -3, -1.5, -1 ]
 *
 * rdivide([5,6,7],[-1,-2,-3]);
 * // [ -5, -3, -2.33333 ]
 */
export function rdivide(x: number[], y: number | number[]): number[] {
  if (isNumber(y)) {
    return arrayFn(x, (val) => val / y);
  }

  return x.map((x, idx) => x / y[idx]);
}
