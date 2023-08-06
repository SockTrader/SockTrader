import { mean } from '../statistics';
import { colon } from '../utils/colon';
import { Sort, sort } from '../utils/sort';
import { subsetlin } from '../utils/subsetlin';
import { continuousDrawdown } from './continuousDrawdown';

/**
 * @method avgDrawdown
 * @summary Average drawdown
 * @description Average drawdown or average K-largest drawdown
 *
 * @param  {array} x asset/portfolio returns
 * @param  {number} k largest drawdown. k = 0 for all continuous drawdown (def: 0)
 * @return {object}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 * var cat = cat;
 *
 * // average drawdown
 * avgDrawdown(x);
 * // 0.0115
 *
 * // 1-largest drawdown
 * avgDrawdown(x,1);
 * // 0.014
 */
export function avgDrawdown(x: number[], k = 0): number {
  const cdd = continuousDrawdown(x);

  if (k === 0) {
    return mean(cdd);
  } else if (k > 0 && k <= cdd.length) {
    const cdds = sort(cdd, Sort.descending);
    return mean(subsetlin(cdds, colon(0, k - 1)));
  } else {
    return NaN;
  }
}
