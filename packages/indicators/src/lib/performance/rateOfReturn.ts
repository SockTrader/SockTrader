import { plus } from '../math';
import { cumprod } from '../math/cumprod';

export enum Mode {
  returns,
  cumulative,
}

/**
 * @method ror
 * @summary Simple rate of return
 * @description Simple rate of return calculated from the last and the first value of
 * an array of numbers.
 *
 * @param  {array} x array of returns or values
 * @param  {string} mode mode of values, 'ret' for returns, 'cum' for cumulative (def: 'ret')
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 *
 * ror(x);
 * // 0.187793
 *
 * ror([100,101,99,98,97,102,103,104],'cum');
 * // 0.04
 */
export function rateOfReturn(x: number[], mode: Mode = Mode.returns): number {
  let eq;

  if (mode === Mode.returns) {
    eq = cumprod(plus(x, 1));
  } else if (mode === Mode.cumulative) {
    eq = [...x];
  } else {
    throw new Error('unknown value');
  }

  return eq[eq.length - 1] / eq[0] - 1;
}
