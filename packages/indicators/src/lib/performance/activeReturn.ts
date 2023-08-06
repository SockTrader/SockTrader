import { Frequency } from '../type/frequency';
import { Mode, annualReturn } from './annualReturn';

/**
 * @method activeReturn
 * @summary Active return
 * @description Asset/Portfolio annualized return minus Benchmark annualized return
 *
 * @param  {array} x asset/portfolio returns
 * @param  {array} y benchmark returns
 * @param  {Frequency} t frequency of data. 1: yearly, 4: quarterly, 12: monthly, 52: weekly, 252: daily
 * @param  {string} mode 'geometric' or 'simple' (def: 'geometric')
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [0.04,-0.022,0.043,0.028,-0.078,-0.011,0.033,-0.049,0.09,0.087];
 *
 * activeReturn(x,y,12);
 * // 0.041979
 */
export function activeReturn(
  x: number[],
  y: number[],
  t: Frequency = Frequency.daily,
  mode: Mode = Mode.geometric
): number {
  return annualReturn(x, t, mode) - annualReturn(y, t, mode);
}
