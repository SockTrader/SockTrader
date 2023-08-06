import { mean } from './mean';

/**
 * @method moment
 * @summary Central moments
 * @description Central moments. First moment is zero, second is variance.
 *
 * @param  {array} x array of elements
 * @param  {number} k k-th central sample moment
 * @return {number|array}
 *
 * @example
 * var x = [ 0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * moment(x,3);
 * // 0.000007
 *
 * moment(x,1);
 * // 0
 */
export function moment(x: number[], k: number) {
  const mu = mean(x);
  return mean(x.map((b) => Math.pow(b - mu, k)));
}
