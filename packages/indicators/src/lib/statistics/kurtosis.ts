import { moment } from './moment';

export enum Kurtosis {
  biasCorrection,
  simple,
}

/**
 * @method kurtosis
 * @summary Kurtosis
 * @description Kurtosis
 *
 * @param  {array} x array of elements
 * @param  {number} flag 0: bias correction, 1: simple (def: 1)
 * @return {number|array}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * kurtosis(x);
 * // 3.037581
 */
export function kurtosis(x: number[], flag: Kurtosis = Kurtosis.simple) {
  const n = x.length;
  const mom4 = moment(x, 4) / Math.pow(moment(x, 2), 2);

  return flag === 1
    ? mom4
    : (((n + 1) * mom4 - 3 * (n - 1)) * (n - 1)) / ((n - 2) * (n - 3)) + 3;
}
