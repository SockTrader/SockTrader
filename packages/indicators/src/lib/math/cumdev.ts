import { mean } from '../statistics';
import { cumsum } from './cumsum';
import { minus } from './minus';

/**
 * @method cumdev
 * @summary Cumulative mean deviation
 * @description  Cumulative mean deviation of the values in array X
 *
 * @param  {array} x array of values
 * @return {array}
 *
 * @example
 * var b = [[-1,3,-1],[4,5,9]];
 * var c = [5,6,3];
 *
 * cumdev([5,6,3]);
 * // [ 0.333333, 1.666667, -0 ]
 */
export function cumdev(x: number[]): number[] {
  return cumsum(minus(x, mean(x)));
}
