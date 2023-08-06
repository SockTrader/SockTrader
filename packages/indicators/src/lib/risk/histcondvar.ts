import { mean } from '../statistics';
import { histvar } from './histvar';

/**
 * @method histcondvar
 * @summary Historical Conditional Value-At-Risk
 * @description Historical Conditional Value-At-Risk. Univariate historical simulation.Single asset
 *
 * @param  {array} x array of values
 * @param  {number} p confidence level in the range [0,1] (def: 0.95)
 * @param  {number} amount amount (def: 1)
 * @param  {number} period time horizon (def: 1)
 * @return {number|array}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * // historical daily conditional VaR at 95% conf level
 * histcondvar(cat(0,x,y),0.95);
 * // [ [ 0.014 ], [ 0.061 ] ]
 *
 * // historical daily conditional VaR at 99% for 100k GBP asset over 10 days
 * histcondvar(cat(0,x,y),0.99,100000,10);
 * // [ [ 4427.188724 ], [ 19289.893727 ] ]
 */
export function histcondvar(
  x: number[],
  p = 0.95,
  amount = 1,
  period = 1
): number {
  const _var = -histvar(x, p);
  const z = [];
  let t = 0;

  for (let i = 0; i < x.length; i++) {
    if (x[i] <= _var) {
      z[t] = x[i];
      t++;
    }
  }

  return -mean(z) * Math.sqrt(period) * amount;
}
