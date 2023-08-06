import { Mode, rateOfReturn } from './rateOfReturn';

/**
 * @method compoundAnnualGrowthRate
 * @summary Compound annual growth rate
 * @description Compound annual growth rate
 *
 * @param  {array} x portfolio/assets returns
 * @param  {number} p number of years (def: 1)
 * @return {number|array}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 * var cat = cat;
 *
 * // CAGR for 10 months on 12 or 0.83 years
 * compoundAnnualGrowthRate(x,x.length/12);
 * // 0.229388
 */
export function compoundAnnualGrowthRate(x: number[], p = 1): number {
  return Math.pow(1 + rateOfReturn(x, Mode.returns), 1 / p) - 1;
}
