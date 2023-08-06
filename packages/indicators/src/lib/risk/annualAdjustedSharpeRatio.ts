import { annualReturn } from '../performance';
import { Mode } from '../performance/annualReturn';
import { kurtosis, skewness } from '../statistics';
import { Frequency } from '../type/frequency';
import { annualRisk } from './annualRisk';

/**
 * @method annualAdjustedSharpeRatio
 * @summary Adjusted Sharpe Ratio
 * @description Sharpe Ratio adjusted for skewness and kurtosis with a penalty factor
 * for negative skewness and excess kurtosis.
 *
 * Adjusted Sharpe ratio = SR x [1 + (S/6) x SR - ((K-3) / 24) x SR^2]
 * SR = sharpe ratio
 * K = kurtosis
 * S = skewness
 *
 * @param  {array} x array of value
 * @param  {number} frisk annual free-risk rate (def: 0)
 * @param  {Frequency} t frequency 252: daily (default), 52: weekly, 12: monthly, 4: quarterly
 * @param  {Mode} mode 'geometric' or 'simple' (def: 'geometric')
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * annualAdjustedSharpeRatio(x,0.02/12);
 * // 0.748134
 */
export function annualAdjustedSharpeRatio(
  x: number[],
  frisk = 0,
  t: Frequency = Frequency.daily,
  mode: Mode = Mode.geometric
) {
  const aret = annualReturn(x, t, mode);
  const arisk = annualRisk(x, t);
  const sr = (aret - frisk) / arisk;
  const sk = skewness(x);
  const ku = kurtosis(x);
  return sr * (1 + (sk / 6) * sr - ((ku - 3) / 24) * Math.sqrt(sr));
}
