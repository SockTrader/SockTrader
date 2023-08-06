import { sqrt } from '../math';
import { Variance, variance } from './variance';

/**
 * @method std
 * @summary Standard deviation
 * @description Standard deviation
 *
 * @param  {array} x array of values
 * @param  {number} flag normalization value 0: population, 1:sample (def: 1)
 * @return {number}
 *
 * @example
 * var a = [5,6,3];
 *
 * std(a);
 * // 1.52753
 *
 * std(a, 0);
 * // 1.24722
 */
export const std = (x: number[], flag: Variance = Variance.sample): number => {
  return sqrt(variance(x, flag));
};
