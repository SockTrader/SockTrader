import { interp1 } from '../math/interp1';
import { rdivide } from '../math/rdivide';
import { times } from '../math/times';
import { colon } from '../utils/colon';
import { sort } from '../utils/sort';

/**
 * @method prctile
 * @summary Percentiles of a sample
 * @description Percentiles of a sample, inclusive
 *
 * @param  {array} x array of elements
 * @param  {number} p p-th percentile in the range [0,100]
 * @return {number}
 *
 * @example
 * var x = [ 0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * prctile(x,5);
 * // -0.014
 *
 * prctile(x,33);
 * // 0.0118
 */
export function prctile(x: number[], p: number): number {
  if (p < 0 || p > 100) {
    throw new Error(
      'p-th percentile must be a real value between 0 and 100 inclusive'
    );
  }

  const arrnum = colon(0.5, x.length - 0.5);
  let _a = sort(x);
  let pq = rdivide(times(arrnum, 100), x.length);

  pq = pq.concat(0, pq, 100);
  _a = _a.concat(_a[0], _a, _a[_a.length - 1]);

  return interp1(pq, _a, p);
}
