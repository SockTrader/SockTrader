import { prod } from '../math';

/**
 * @method timeWeightedReturn
 * @summary True Time-weighted return measures the returns of the assets irrespective of the amount invested
 * @description rue Time-weighted return measures the returns of the assets irrespective of the amount invested
 *
 * @param  {array} mv array of market values
 * @param  {array} cf array of external cashflows (inflows/outflows)
 * @return {number}
 *
 * @example
 * var mv = [250000,255000,257000,288000,293000,285000], cf = [0,0,25000,0,-10000,0];
 *
 * timeWeightedReturn(mv,cf);
 * // 0.07564769566198049
 */

function timeWeightedReturn(mv: number[], cf: number[]): number {
  if (mv.length !== cf.length) {
    throw new Error('market value and cash flows must be of the same size');
  }

  const _twr = [1];
  for (let i = 1; i < mv.length; i++) {
    _twr[i] = mv[i] / (mv[i - 1] + cf[i - 1]);
  }
  return prod(_twr) - 1;
}

export { timeWeightedReturn };
