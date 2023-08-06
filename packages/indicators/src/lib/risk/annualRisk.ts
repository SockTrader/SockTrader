import { std } from '../statistics';
import { Frequency } from '../type/frequency';

/**
 * @method annualRisk
 * @summary Annualized Risk
 * @description Annualized standard deviation of asset/portfolio returns
 *
 * @param  {array} x asset/portfolio returns
 * @param  {number} t frequency of data. 1: yearly, 4: quarterly, 12: monthly, 52: weekly, 252: daily
 * @return {number|array}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 *
 * annualRisk(x,12);
 * // 0.080473
 */
export function annualRisk(x: number[], t: Frequency = Frequency.daily) {
  return Math.sqrt(t) * std(x);
}
