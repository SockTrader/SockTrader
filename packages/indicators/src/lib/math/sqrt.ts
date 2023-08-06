import { isNumber } from '../utils';

/**
 * @method log
 * @summary Square root
 * @description Square root
 *
 * @param  {array} x element
 * @return {number|array}
 *
 * @example
 * sqrt([5,6,3]);
 * // [ 2.23607, 2.44949, 1.73205 ]
 */
function sqrt(x: number): number;
function sqrt(x: number[]): number[];
function sqrt(x: number | number[]): number | number[] {
  if (isNumber(x)) return Math.sqrt(x);
  return x.map(Math.sqrt);
}

export { sqrt };
