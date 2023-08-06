import { isNumber } from '../utils';

/**
 * @method power
 * @summary Element-wise power X. ^ Y
 * @description Element-wise power X. ^ Y
 *
 * @param  {array} x number or array of values
 * @param  {number|array} y number or array of values
 * @return {array}
 *
 * @example
 * power([5,6,4],[3,-1,0]);
 * // [ 2, 7, 4 ]
 *
 * power([5,6,4],10);
 * // [-5, -4, -6]
 */
function power(x: number[], y: number): number[];
function power(x: number[], y: number[]): number[];
function power(x: number[], y: number | number[]): number | number[] {
  if (Array.isArray(y) && x.length !== y.length)
    throw new Error('invalid length');

  const getYVal = isNumber(y) ? () => y : (index: number) => y[index];

  return x.map((x, idx) => Math.pow(x, getYVal(idx)));
}

export { power };
