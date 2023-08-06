import { moment } from './moment';

export enum Skewness {
  biasCorrection,
  simple,
}

/**
 * @method skewness
 * @summary Skewness
 * @description Skewness
 *
 * @param  {array} x array of elements
 * @param  {number} flag 0: bias correction, 1: simple (def: 1)
 * @return {number|array}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * skewness(x);
 * // 0.617481
 */
export function skewness(x: number[], flag: Skewness = Skewness.simple) {
  const n = x.length;
  const mom3 = moment(x, 3) / Math.pow(moment(x, 2), 1.5);

  return flag === 1 ? mom3 : Math.sqrt((n - 1) / n) * (n / (n - 2)) * mom3;
}
