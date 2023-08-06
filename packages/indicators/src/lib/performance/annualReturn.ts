import { plus, prod } from '../math';
import { mean } from '../statistics';
import { Frequency } from '../type/frequency';

export enum Mode {
  geometric,
  simple,
}

/**
 * @method annualReturn
 * @summary Annualized Return
 * @description Average annualized returns over a period, convenient when comparing returns.
 * It can be an Arithmetic or Geometric (default) average return: if compounded with itself the
 * geometric average will be equal to the cumulative return
 *
 * @param  {array} x asset/portfolio returns
 * @param  {Frequency} t frequency of data. 1: yearly, 4: quarterly, 12: monthly, 52: weekly, 252: daily
 * @param  {string} mode 'geometric' or 'simple' (def: 'geometric')
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 *
 * annualReturn(x,12);
 * // 0.233815
 */
export function annualReturn(
  x: number[],
  t: Frequency = Frequency.daily,
  mode: Mode = Mode.geometric
): number {
  const n = x.length;
  if (mode === Mode.geometric) {
    return Math.pow(prod(plus(x, 1)), t / n) - 1;
  } else if (mode === Mode.simple) {
    return mean(x) * t;
  } else {
    throw new Error('unknown mode');
  }
}
