import { quantile } from '../statistics/quantile';

/**
 * @method histvar
 * @summary Historical Value-At-Risk
 * @description Univariate historical simulation. Single asset
 *
 * @param  {array} x array of values
 * @param  {number} p confidence level in the range [0,1] (def: 0.95)
 * @param  {number} amount amount (def: 1)
 * @param  {number} period time horizon (def: 1)
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * // historical daily VaR at 95% conf level
 * histvar(cat(0,x,y),0.95);
 * // [ [ 0.014 ], [ 0.061 ] ]
 *
 * // historical daily VaR at 99% for 100k GBP asset over 10 days
 * histvar(cat(0,x,y),0.99,100000,10);
 * // [ [ 4427.188724 ], [ 19289.893727 ] ]
 */
export function histvar(x: number[], p = 0.95, amount = 1, period = 1): number {
  return -quantile(x, 1 - p) * Math.sqrt(period) * amount;
}
