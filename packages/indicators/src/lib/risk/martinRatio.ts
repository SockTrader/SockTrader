import { power, sqrt, sum } from '../math';
import { annualReturn } from '../performance';
import { Frequency } from '../type/frequency';
import { continuousDrawdown } from './continuousDrawdown';
import { Mode } from './drawdown';
import { ulcerIndex } from './ulcerIndex';

/**
 * @method martinRatio
 * @summary Martin Ratio
 * @description A risk-adjusted measure with free risk and Ulcer index.
 *
 * Martin Ratio = (Portfolio Return - RiskFree) / Ulcer Index
 *
 * @param  {array} x asset/portfolio returns
 * @param  {number} frisk annual free-risk rate (def: 0)
 * @param  {number} t frequency of data. 1: yearly, 4: quarterly, 12: monthly, 52: weekly, 252: daily (def: 252)
 * @param  {string} mode drawdown calculation. 'return','geometric' (def: 'return')
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 * var cat = cat;
 *
 * martinRatio(x,0,12);
 * // 44.425456
 *
 * martinRatio(cat(0,x,y),0,12);
 * // [ [ 44.425456 ], [ 2.438364 ] ]
 */
export function martinRatio(
  x: number[],
  frisk = 0,
  t: Frequency = Frequency.daily,
  mode: Mode = Mode.return
) {
  const annret = annualReturn(x, t);
  // @TODO bug? const "dd" is not used!
  const dd = sqrt(sum(power(continuousDrawdown(x), 2)));
  return (annret - frisk) / ulcerIndex(x, mode);
}
