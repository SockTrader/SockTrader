import { prctile } from './prctile';

/**
 * @method quantile
 * @summary Quantilies of a sample
 * @description Quantilies of a sample
 *
 * @param  {array} x array of elements
 * @param  {number} p p-th quantile in the range [0,1]
 * @return {number}
 *
 * @example
 * var x = [ 0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * quantile(x,0.25);
 * // 0.003
 */
export function quantile(x: number[], p: number): number {
  if (p < 0 || p > 1) {
    throw new Error(
      'p-th percentile must be a real value between 0 and 1 inclusive'
    );
  }

  return prctile(x, p * 100);
}
