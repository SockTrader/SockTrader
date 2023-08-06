import { downsidePotential } from './downsidePotential';
import { upsidePotential } from './upsidePotential';

/**
 * @method omegaRatio
 * @summary Omega ratio
 * @description Omega ratio
 *
 * @param  {array} x asset/portfolio returns
 * @param  {number} mar minimum acceptable return (def: 0)
 * @return {number|array}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 *
 * omegaRatio(x);
 * // 8.782609
 */
export function omegaRatio(x: number[], mar = 0) {
  return upsidePotential(x, mar) / downsidePotential(x, mar);
}
