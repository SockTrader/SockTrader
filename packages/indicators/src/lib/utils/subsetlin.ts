import { arrayFn } from './arrayFn';

/**
 * @method  substelin
 * @summary Subset of array based on linear indexing
 * @description Subset of array based on linear indexing by rows
 *
 * @param  {array} m   array of elements
 * @param  {number|array} idx linear indexing
 * @return {number|array}
 *
 * @example
 * var a = [[5,6,5],[7,8,-1]];
 * var c = [5,6,3];
 *
 * subsetlin(a,1);
 * // [ 6 ]
 *
 * // subset by rows
 * subsetlin(a,[0,1,2,3]);
 * // [ 5, 6, 5, 7 ]
 *
 * subsetlin(c,[0,1]);
 * // [ 5, 6 ]
 *
 * subsetlin(c,[[0,1],[1,2]]);
 * // [ [ 5, 6 ], [ 6, 3 ] ]
 */
export function subsetlin(m: number[], idx: number[]): number[] {
  return arrayFn(idx, (val) => m[val]);
}
