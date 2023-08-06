import { arrayFn } from '../utils/arrayFn';

/**
 * @method fix
 * @summary Round toward zero
 * @description Round toward zero
 *
 * @param  {number|array} x number or array of values
 * @return {number|array}
 *
 * @example
 * fix(3.78);
 * // 3
 *
 * fix([4.51,-1.4]);
 * // [ 4, -1 ]
 *
 * fix([[4.51,-1.4],[3.78,0.01]]);
 * // [ [ 4, -1 ], [ 3, 0 ] ]
 */
function fix(x: number): number;
function fix(x: number[]): number[];
function fix(x: number | number[]): number | number[] {
  const _fix = (y: number) => (y < 0 ? Math.ceil(y) : Math.floor(y));
  return arrayFn(x as never, _fix);
}

export { fix };
