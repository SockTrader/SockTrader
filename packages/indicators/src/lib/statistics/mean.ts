import { sum } from '../math';

/**
 * @method mean
 * @summary Average value of array
 * @description Average value of array
 *
 * @param  {array} x array of values
 * @return {number|array}
 *
 * @example
 * var a = [[5,6,5],[7,8,-1]];
 * var c = [5,6,3];
 *
 * mean(c);
 * // 4.66667
 *
 * mean([[5,6,5],[7,8,-1]]);
 * // [ [ 5.333333 ], [ 4.666667 ] ]
 *
 * mean([[5,6,5],[7,8,-1]],1);
 * // [ [ 6, 7, 2 ] ]
 */
function mean(x: number[]): number {
  return sum(x) / x.length;
}

export { mean };
