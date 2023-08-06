import { annualReturn } from '../performance';
import { Frequency } from '../type/frequency';
import { continuousDrawdown } from './continuousDrawdown';

/**
 * @method sterlingRatio
 * @summary Sterling Ratio
 * @description A risk-adjusted measure like Calmar ratio but the denominator is
 * the largest consecutive drawdown (excluded the 10% excess in the original formula)
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
 * sterlingRatio(x,0,12);
 * // 16.701049
 */
export function sterlingRatio(
  x: number[],
  frisk = 0,
  t: Frequency = Frequency.daily
): number {
  const annret = annualReturn(x, t);
  const ldd = Math.max(...continuousDrawdown(x));
  return (annret - frisk) / ldd;
}
