import { minus } from '../math';
import { mean, std } from '../statistics';

/**
 * @method informationRatio
 * @summary Information Ratio
 * @description Information Ratio
 *
 * @param  {array} x asset/portfolio returns
 * @param  {array} y benchmark returns
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 * var z = [0.04,-0.022,0.043,0.028,-0.078,-0.011,0.033,-0.049,0.09,0.087];
 *
 * informationRatio(x,y);
 * // 0.0936915
 */
export function informationRatio(x: number[], y: number[]): number {
  return mean(minus(x, y)) / std(minus(x, y));
}
