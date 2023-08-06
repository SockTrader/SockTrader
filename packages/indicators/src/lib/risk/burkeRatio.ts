import { power, sqrt, sum } from '../math';
import { annualReturn } from '../performance';
import { Frequency } from '../type/frequency';
import { continuousDrawdown } from './continuousDrawdown';

export enum Mode {
  simple,
  modified,
}

/**
 * @method burkeRatio
 * @summary Burke Ratio
 * @description A risk-adjusted measure with free risk and drawdowns.
 * For the 'simple' mode the excess return over free risk is divided by the square root of
 * the sum of the square of the drawdowns. For the 'modified' mode the Burke Ratio is multiplied
 * by the square root of the number of datas.
 *
 * @param  {array} x asset/portfolio returns
 * @param  {number} frisk annual free-risk rate (def: 0)
 * @param  {number} t frequency 252: daily (default), 52: weekly, 12: monthly, 4: quarterly
 * @param  {string} mode 'simple' or 'modified' (def: 'simple')
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 * var cat = cat;
 *
 * burkeRatio(x,0,12);
 * // 14.048563
 *
 * burkeRatio(x,0,12,'modified');
 * // 44.425456
 */
export function burkeRatio(
  x: number[],
  frisk = 0,
  t: Frequency = Frequency.daily,
  mode: Mode = Mode.simple
): number {
  const annret = annualReturn(x, t);
  const dd = sqrt(sum(power(continuousDrawdown(x), 2)));

  if (mode === Mode.simple) {
    return (annret - frisk) / dd;
  } else if (mode === Mode.modified) {
    return ((annret - frisk) / dd) * sqrt(x.length);
  } else {
    throw new Error('unknown mode');
  }
}
