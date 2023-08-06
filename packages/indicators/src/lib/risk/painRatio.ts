import { power, sqrt, sum } from '../math';
import { annualReturn } from '../performance';
import { Frequency } from '../type/frequency';
import { continuousDrawdown } from './continuousDrawdown';
import { Mode } from './drawdown';
import { painIndex } from './painIndex';

/**
 * @method painRatio
 * @summary Pain Ratio
 * @description A risk-adjusted measure with free risk and Pain index.
 *
 * Pain Ratio = (Portfolio Return - RiskFree) / Pain Index
 *
 * @param  {array} x asset/portfolio returns
 * @param  {number} frisk annual free-risk rate (def: 0)
 * @param  {number} t frequency of data. 1: yearly, 4: quarterly, 12: monthly, 52: weekly, 252: daily (def: 252)
 * @param  {string} mode drawdown calculation. 'return','geometric' (def: 'return')
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 *
 * painRatio(x,0,12);
 * // 101.044955
 */
export function painRatio(
  x: number[],
  frisk = 0,
  t: Frequency = Frequency.daily,
  mode: Mode = Mode.geometric
): number {
  const annRet = annualReturn(x, t);
  // @TODO bug? const "dd" is not used!
  const dd = sqrt(sum(power(continuousDrawdown(x), 2)));
  return (annRet - frisk) / painIndex(x, mode);
}
