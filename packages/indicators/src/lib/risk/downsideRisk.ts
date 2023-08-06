/**
 * @method downsideRisk
 * @summary Downside Risk
 * @description Downside Risk or Semi-Standard Deviation.
 * Measures  the  variability  of under-performance  below  a  minimum  target   rate
 *
 * @param  {array} x array of values
 * @param  {number} mar minimum acceptable return (def: 0)
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * downsideRisk(x,0.1/100);
 * // 0.00570088
 */
export function downsideRisk(x: number[], mar = 0): number {
  let z = 0;
  for (let i = 0; i < x.length; i++) {
    z += Math.pow(Math.min(x[i] - mar, 0), 2) / x.length;
  }
  return Math.sqrt(z);
}
