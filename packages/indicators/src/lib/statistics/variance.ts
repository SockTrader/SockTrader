import { abs, minus, power, sum } from '../math';
import { mean } from './mean';

export enum Variance {
  population = 0,
  sample = 1,
}

/**
 * @method variance
 * @summary Variance
 * @description  Variance
 *
 * @param  {array} x array of values
 * @param  {number} flag normalization value 0: population, 1:sample (def: 1)
 * @return {number|array}
 *
 * @example
 * var a = [[5,6,5],[7,8,-1]];
 * var c = [5,6,3];
 *
 * variance(c);
 * // 2.33333
 *
 * variance(c,0);
 * // 1.55556
 *
 * variance(a,0);
 * // [ [ 0.222222 ], [ 16.222222 ] ]
 *
 * variance(a,0,1);
 * // [ [ 1, 1, 9 ] ]
 */
export const variance = (
  x: number[],
  flag: Variance = Variance.sample
): number => {
  return sum(power(abs(minus(x, mean(x))), 2)) / (x.length - flag);
};
