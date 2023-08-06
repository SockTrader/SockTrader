import { isNumber } from '../utils';

/**
 * @method minus
 * @summary Subtraction X - Y
 * @description Subtraction X - Y. X and Y must have the same dimension unless Y is a number
 *
 * @param  {array} x number or array of values
 * @param  {number|array} y number or array of values
 * @return {array}
 *
 * @example
 * minus([5,6,4],[3,-1,0]);
 * // [ 2, 7, 4 ]
 *
 * minus([5,6,4],10);
 * // [-5, -4, -6]
 */
function minus(x: number[], y: number): number[];
function minus(x: number[], y: number[]): number[];
function minus(x: number[], y: number | number[]): number | number[] {
  if (Array.isArray(y) && x.length !== y.length) throw new Error('invalid length');

  const getYVal = isNumber(y) ? () => y : (index: number) => y[index];

  return x.map((x, idx) => x - getYVal(idx));
}

export { minus };
