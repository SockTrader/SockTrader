import { arrayFn } from '../utils/arrayFn';

/**
 * @method log
 * @summary Natural logarithm
 * @description Natural logarithm
 *
 * @param  {number|array} x element
 * @return {number|array}
 *
 * @example
 * log(6);
 * // 1.79176
 *
 * log([5,6,3]);
 * // [ 1.60944, 1.79176, 1.09861 ]
 */
function log(x: number): number;
function log(x: number[]): number[];
function log(x: number | number[]): number | number[] {
  return arrayFn(x as never, Math.log);
}

export { log };
