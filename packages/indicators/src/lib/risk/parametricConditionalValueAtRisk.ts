import { norminv } from '../statistics/norminv';
import { normpdf } from '../statistics/normpdf';
import { isNumber } from '../utils';
import { isArray } from '../utils/isArray';

/**
 * @method parametricConditionalValueAtRisk
 * @summary Parametric Conditional Value-At-Risk
 * @description Parametric Conditional Value-At-Risk. More sensitive to the shape of the loss distribution in the tails
 * Also known as Expected Shortfall (ES), Expected Tail Loss (ETL).
 *
 * @param  {number|array} mu mean value
 * @param  {number|array} sigma standard deviation (def: 1)
 * @param  {number} p cVaR confidende level in range [0,1] (def: 0.95)
 * @param  {number} amount portfolio/asset amount (def: 1)
 * @param  {number} period time horizon (def: 1)
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 * var y = [-0.005,0.081,0.04,-0.037,-0.061,0.058,-0.049,-0.021,0.062,0.058];
 *
 * // parametric daily Var at 95% conf level
 * parametricConditionalValueAtRisk(mean(x),std(x));
 * // 0.030018
 *
 * //parametric daily VaR at 99% for 100k GBP asset over 10 days (two assets)
 * parametricConditionalValueAtRisk(mean(cat(0,x,y)),std(cat(0,x,y)),0.99,100000,10);
 * // [ [ 19578.980844 ], [ 44511.107219 ] ]
 */
function parametricConditionalValueAtRisk(
  mu: number,
  sigma: number,
  p?: number,
  amount?: number,
  period?: number
): number;
function parametricConditionalValueAtRisk(
  mu: number[],
  sigma: number[],
  p?: number,
  amount?: number,
  period?: number
): number;
function parametricConditionalValueAtRisk(
  mu: number | number[],
  sigma: number | number[],
  p = 0.95,
  amount = 1,
  period = 1
): number | number[] {
  const _pcvar = (
    _mu: number,
    _sigma: number,
    p: number,
    amount: number,
    period: number
  ) => {
    return (
      ((_sigma * normpdf(norminv(1 - p))) / (1 - p)) *
        amount *
        Math.sqrt(period) -
      _mu
    );
  };

  if (isNumber(mu) && isNumber(sigma)) {
    return _pcvar(mu, sigma, p, amount, period);
  }

  if (isArray(mu) && isArray(sigma)) {
    return mu.map((el, idx) => _pcvar(mu[idx], sigma[idx], p, amount, period));
  }

  throw new Error('Invalid arguments');
}

export { parametricConditionalValueAtRisk };
