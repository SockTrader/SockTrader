import { sum } from '../math';
import { Mode, drawdown } from './drawdown';

/**
 * @method painIndex
 * @summary Pain Index
 * @description Mean value of the drawdowns, similar to Ulcer Index.
 *
 * @param  {array} x asset/portfolio returns
 * @param  {string} mode drawdown calculation. 'return','geometric' (def: 'return')
 * @return {number|array}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 *
 * painIndex(x);
 * // 0.0023
 */
export function painIndex(x: number[], mode: Mode = Mode.return) {
  const dd = drawdown(x, mode).dd;
  const n = x.length;
  return sum(dd) / n;
}
