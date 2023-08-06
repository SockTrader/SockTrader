import { isNumber } from '../utils';
import { arrayFn } from '../utils/arrayFn';

/**
 * @method times
 * @summary Array multiply X. * Y
 * @description  Element-by-element multiplication. X and Y must have the same dimensions unless ones is a number
 *
 * @param  {array} x array of values
 * @param  {array} y array of values
 * @return {array}
 *
 * @example
 * times([5,6,4],[3,-1,0]);
 * // [ 15, -6, 0 ]
 *
 * times([5,6,4],10);
 * // [ 50, 60, 40 ]
 */
export function times(x: number[], y: number | number[]): number[] {
  if (isNumber(y)) {
    return arrayFn(x, (val) => val * y);
  }

  return x.map((x, idx) => x * y[idx]);
}
