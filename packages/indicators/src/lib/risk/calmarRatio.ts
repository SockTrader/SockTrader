import { annualReturn } from '../performance';
import { Frequency } from '../type/frequency';
import { drawdown } from './drawdown';

/**
 * @method calmarRatio
 * @summary Calmar Ratio
 * @description A risk-adjusted measure like Sharpe ratio that uses maximum drawdown instead of
 * standard deviation for risk.
 *
 * @param  {array} x asset/portfolio returns
 * @param  {number} frisk annual free-risk rate (def: 0)
 * @param  {number} t frequency of data. 1: yearly, 4: quarterly, 12: monthly, 52: weekly, 252: daily (def: 252)
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 * var cat = cat;
 *
 * calmarRatio(x,0,12);
 * // 16.701049
 */
export function calmarRatio(
  x: number[],
  frisk = 0,
  t: Frequency = Frequency.daily
) {
  const annret = annualReturn(x, t);
  const maxdd = drawdown(x).maxdd;
  return (annret - frisk) / maxdd;
}
