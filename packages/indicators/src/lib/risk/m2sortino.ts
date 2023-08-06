import { sqrt } from '../math';
import { annualReturn } from '../performance';
import { Frequency } from '../type/frequency';
import { downsideRisk } from './downsideRisk';
import { sortino } from './sortino';

/**
 * @method m2sortino
 * @summary M-squared for Sortino
 * @description M2 calculated for Downside risk instead of Total Risk
 *
 * @param  {array} x asset/portfolio values
 * @param  {array} y benchmark values
 * @param  {number} frisk free-risk rate (def: 0)
 * @param  {number} mar minimum acceptable return (def: 0)
 * @param  {number} t frequency of data. 1: yearly, 4: quarterly, 12: monthly, 52: weekly, 252: daily (def: 252)
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * m2sortino(x,y,0,0,12);
 * // 0.103486
 */
export function m2sortino(
  x: number[],
  y: number[],
  frisk = 0,
  mar = 0,
  t: Frequency = Frequency.daily
) {
  return (
    annualReturn(x, t) +
    sortino(x, frisk, mar) *
      (downsideRisk(y, mar) * sqrt(t) - downsideRisk(x, mar) * sqrt(t))
  );
}
