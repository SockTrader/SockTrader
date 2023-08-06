import { norminv } from '../statistics/norminv';
import { isNumber } from '../utils';
import { isArray } from '../utils/isArray';

/**
 * @method parametricValueAtRisk
 * @summary Parametric Value-At-Risk
 * @description Parametric Value-At-Risk. Assets or portfolio returns are normally distributed.
 * It manages numbers, arrays, row vectors [[a,b,...,n]] and column vectors [[a],[b],...,[n]]
 *
 * @param  {number|array} mu mean value (def: 0)
 * @param  {number|array} sigma standard deviation (def: 1)
 * @param  {number} p VaR confidende level in range [0,1] (def: 0.95)
 * @param  {number} amount portfolio/asset amount (def: 1)
 * @param  {number} period time horizon (def: 1)
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * // VaR with numbers
 * parametricValueAtRisk(0,1);
 * // 1.644854
 *
 * // VaR with arrays
 * parametricValueAtRisk([0,0,0],[1,2,3]);
 * [ 1.644854, 3.289707, 4.934561 ]
 *
 * // parametric VaR at 95% conf level
 * parametricValueAtRisk(mean(x),std(x));
 * // 0.020311
 *
 * parametricValueAtRisk(mean(cat(0,x,y)),std(cat(0,x,y)));
 * // [ [ 0.020311 ], [ 0.074269 ] ]
 *
 * //parametric VaR at 99% for 100k GBP asset over 10 days (two assets)
 * parametricValueAtRisk(mean(cat(0,x,y)),std(cat(0,x,y)),0.99,100000,10);
 * // [ [ 11429.165523 ], [ 34867.319072 ] ]
 */
function parametricValueAtRisk(
  mu: number,
  sigma: number,
  p?: number,
  amount?: number,
  period?: number
): number;
function parametricValueAtRisk(
  mu: number[],
  sigma: number[],
  p?: number,
  amount?: number,
  period?: number
): number[];
function parametricValueAtRisk(
  mu: number | number[],
  sigma: number | number[],
  p = 0.95,
  amount = 1,
  period = 1
): number | number[] {
  const _pvar = (
    _mu: number,
    _sigma: number,
    p: number,
    amount: number,
    period: number
  ) => (-norminv(1 - p) * _sigma - _mu) * Math.sqrt(period) * amount;

  if (isNumber(mu) && isNumber(sigma)) {
    return _pvar(mu, sigma, p, amount, period);
  }

  if (isArray(mu) && isArray(sigma)) {
    return mu.map((el, idx) => _pvar(mu[idx], sigma[idx], p, amount, period));
  }

  throw new Error('Invalid arguments');
}

export { parametricValueAtRisk };
