import { linearRegression } from '../math/linearRegression';
import { mean } from '../statistics';

/**
 * @method jensenAlpha
 * @summary Jensen alpha
 * @description  Ex-post alpha calculated with regression line. Free-risk is the avereage free-risk for the timeframe selected.
 *
 * @param  {array} x asset/portfolio values
 * @param  {array} y benchmark values
 * @param  {number} frisk  free-risk (def: 0)
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 * var z = [0.04,-0.022,0.043,0.028,-0.078,-0.011,0.033,-0.049,0.09,0.087];
 * var cat = cat;
 *
 * jensenAlpha(x,y);
 * // 0.017609
 */
export function jensenAlpha(x: number[], y: number[], frisk = 0) {
  const beta = linearRegression(x, y).beta;
  return mean(x) - frisk - beta * (mean(y) - frisk);
}
