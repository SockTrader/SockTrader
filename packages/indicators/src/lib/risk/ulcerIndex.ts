import { power, sqrt, sum } from '../math';
import { Mode, drawdown } from './drawdown';

/**
 * @method ulcerIndex
 * @summary Ulcer Index
 * @description Ulcer Index of Peter G. Martin (1987). The impact of long, deep drawdowns will have significant
 * impact because the underperformance since the last peak is squared.
 *
 * @param  {array} x asset/portfolio returns
 * @param  {string} mode drawdown calculation. 'return','geometric' (def: 'return')
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var xt = [[0.003,0.026],[0.015,-0.009],[0.014,0.024],[0.015,0.066],[-0.014,0.039]];
 * ulcerIndex(x);
 * // 0.005263
 *
 * ulcerIndex(xt,'return',1);
 * // [ [ 0.006261, 0.004025 ] ]
 */
export function ulcerIndex(x: number[], mode: Mode = Mode.return) {
  const dd = drawdown(x, mode).dd;
  const n = x.length;
  return sqrt(sum(power(dd, 2)) / n);
}
