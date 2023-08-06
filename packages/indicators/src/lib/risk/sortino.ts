import { mean } from '../statistics';
import { downsideRisk } from './downsideRisk';

/**
 * @method sortino
 * @summary Sortino ratio
 * @description  Sortino ratio
 *
 * @param  {array} x asset/portfolio returns
 * @param  {number} frisk free-risk rate (def: 0)
 * @param  {number} mar minimum acceptable return (def: 0)
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * sortino(x,0.02/12);
 * // 3.08438
 *
 * sortino(cat(0,x,y),0.01/12,0.5);
 * // [ [ 0.035364 ], [ 0.024015 ] ]
 */
export function sortino(x: number[], frisk = 0, mar = 0): number {
  return (mean(x) - frisk) / downsideRisk(x, mar);
}
