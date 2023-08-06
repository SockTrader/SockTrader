import { minus } from '../math';
import { std } from '../statistics';

/**
 * @method trackingError
 * @summary Tracking Error (ex-post)
 * @description  Ex-post tracking error
 *
 * @param  {array} x array of X values
 * @param  {array} y array of Y values
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 * var z = [0.04,-0.022,0.043,0.028,-0.078,-0.011,0.033,-0.049,0.09,0.087];
 * var cat = cat;
 *
 * trackingError(x,z);
 * // 0.068436
 *
 * trackingError(cat(0,x,y),z);
 * // [ [ 0.068436 ], [ 0.058622 ] ]
 */
export const trackingError = function (x: number[], y: number[]): number {
  return std(minus(x, y));
};
