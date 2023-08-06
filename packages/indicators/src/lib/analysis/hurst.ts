import { cumdev } from '../math/cumdev';
import { std, Variance } from '../statistics';

/**
 * @method hurst
 * @summary Hurst index/exponent
 * @description It's a useful statistic for detecting if a time series is mean reverting (anti-persistent), totally random or persistent.
 * A value in the range [0.5) indicates mean-reverting (anti-persistent)
 * A value of 0.5 indicate a random walk
 * A value H in the range (0.5,1] indicates momentum (persistent)
 *
 * @param  {array} x array of values
 * @param  {number} flag normalization value 0: population, 1:sample (def: 1)
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * hurst(x);
 * // 0.344059
 *
 * hurst(x,1);
 * // 0.3669383
 */
export function hurst(x: number[], flag: Variance = Variance.sample): number {
  const cdev = cumdev(x);
  const rs = (Math.max(...cdev) - Math.min(...cdev)) / std(x, flag);
  return Math.log(rs) / Math.log(x.length);
}
