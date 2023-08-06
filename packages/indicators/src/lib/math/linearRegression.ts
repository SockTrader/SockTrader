import { sum } from './sum';
import { times } from './times';

/**
 * @method  linearRegression
 * @summary Linear regression of Y on X
 * @description Return an object with fields: Beta, Alpha, R-squared, function
 *
 * @param  {array} y array of elements in Y
 * @param  {array} x array of elements in X
 * @return {object}
 *
 * @example
 * var x = [ 0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * linearRegression(x,y);
 * // { beta: 0.02308942571228251, alpha: 0.017609073236025237, rsq: 0.0027553853574994254, fun: [Function] }
 *
 * linearRegression([100,101,99,102,105],[1,2,3,4,5])
 * // { beta: 1.1, alpha: 98.1, rsq: 0.5707547169811321, fun: [Function] }
 *
 * linearRegression([100,101,99,102,105],[1,2,3,4,5]).fun(6);
 * // 104.69
 *
 */
export function linearRegression(y: number[], x: number[]) {
  const n = y.length;
  const sx = sum(x);
  const sy = sum(y);
  const sxy = sum(times(x, y));
  const sxx = sum(times(x, x));
  const syy = sum(times(y, y));
  const beta = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const alpha = (sy - beta * sx) / n;
  const rsq = Math.pow(
    (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy)),
    2
  );

  return {
    beta: beta,
    alpha: alpha,
    rsq: rsq,
    fun: (x: number) => beta * x + alpha,
  };
}
