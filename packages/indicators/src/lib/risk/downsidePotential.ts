/**
 * @method downsidePotential
 * @summary Downside potential
 * @description Downside potential
 *
 * @param  {array} x array of values
 * @param  {number} mar minimum acceptable return (def: 0)
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 *
 * downsidePotential(x,0.1/100);
 * // 0.0025
 */
export const downsidePotential = function (x: number[], mar = 0): number {
  let z = 0;
  for (let i = 0; i < x.length; i++) {
    z += Math.max(mar - x[i], 0) / x.length;
  }
  return z;
};
