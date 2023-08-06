import { mean, std } from '../statistics';

/**
 * @method sharpeRatio
 * @summary Sharpe Ratio
 * @description Sharpe Ratio. Compute Sharpe ratio for an array X of values (daily, weekly, etc) and
 * a free-risk rate. Annual free-risk must be divided to match the right timeframe.
 *
 * @param  {array} x array of value
 * @param  {number} riskFreeRate annual risk-free rate (def: 0)
 * @return {number|array}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 *
 * sharpeRatio(x,0.02/12);
 * // 0.698794
 */
export function sharpeRatio(x: number[], riskFreeRate = 0): number {
  return (mean(x) - riskFreeRate) / std(x);
}
