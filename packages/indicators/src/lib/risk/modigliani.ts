import { mean, std } from '../statistics';
import { sharpeRatio } from './sharpeRatio';

/**
 * @method modigliani
 * @summary Modigliani index for risk-adjusted return
 * @description Modigliani index for risk-adjusted return
 *
 * @param  {array} x asset/portfolio values
 * @param  {array} y benchmark values
 * @param  {number} frisk free-risk rate (def: 0)
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 * var z = [0.04,-0.022,0.043,0.028,-0.078,-0.011,0.033,-0.049,0.09,0.087];
 * var cat = cat;
 *
 * modigliani(x,y);
 * // 0.0406941
 */
export function modigliani(x: number[], y: number[], frisk = 0) {
  return mean(x) + sharpeRatio(x, frisk) * (std(y) - std(x));
}
