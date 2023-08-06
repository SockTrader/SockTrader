/**
 * @method continuousDrawdown
 * @summary Continuous Drawdown
 * @description Continuous Drawdown
 *
 * @param  {array} x asset/portfolio returns
 * @return {array}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * continuousDrawdown(x);
 * // [ 0.009, 0.014 ]
 *
 * continuousDrawdown(cat(0,x,y));
 * // [ [ 0.009, 0.014 ], [ 0.005, 0.095743, 0.068971 ] ]
 */
export function continuousDrawdown(x: number[]): number[] {
  const cdd = [];
  let tmp = 0;
  let t = 0;

  for (let i = 0; i < x.length; i++) {
    if (i === 0 && x[i] < 0) {
      tmp = 1 + x[i];
    }
    if (i > 0) {
      if (x[i] < 0) {
        if (tmp === 0) {
          tmp = 1 + x[i];
        } else {
          tmp = tmp * (1 + x[i]);
        }
      }
      if (x[i] >= 0) {
        if (tmp !== 0) {
          cdd[t] = 1 - tmp;
          t++;
          tmp = 0;
        }
      }
    }
  }

  if (tmp !== 0) {
    cdd.push(1 - tmp);
  }

  return cdd;
}
