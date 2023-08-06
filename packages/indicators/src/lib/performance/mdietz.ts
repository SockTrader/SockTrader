import { isNumber } from '../utils';
import { isArray } from '../utils/isArray';

/**
 * @method mdietz
 * @summary Historical performance of an investment portfolio with external cash flows
 * @description Historical performance of an investment portfolio with external cash flows
 *
 * @param  {number} ev ending value
 * @param  {number} bv beginning market value
 * @param  {number|array} cf external cashflows (inflows/outflows)
 * @param  {number|array} cfd number of calendar days from the beginning of the period that cash flow occurs
 * @param  {number} cd total number of calendar days in the measurement period
 * @return {number}
 *
 * @example
 * var ev = 104.4,bv = 74.2,cf = 37.1,cfd = 14, cd = 31;
 * mdietz(ev,bv,cf,cfd,cd);
 * // -0.07298099559862156
 *
 * var ev = 1200,bv = 1000,cf = [10,50,35,20],cfd = [15,38,46,79],cd = 90;
 * mdietz(ev,bv,cf,cfd,cd);
 * // 0.0804
 */
function mdietz(
  ev: number,
  bv: number,
  cf: number,
  cfd: number,
  cd: number
): number;
function mdietz(
  ev: number,
  bv: number,
  cf: number[],
  cfd: number[],
  cd: number
): number;
function mdietz(
  ev: number,
  bv: number,
  cf: number | number[],
  cfd: number | number[],
  cd: number
): number {
  let md = -99999;
  const w = [];
  if (isNumber(cf) && isNumber(cfd)) {
    md = (ev - bv - cf) / (bv + cf * (1 - cfd / cd));
  } else if (isArray(cf) && isArray(cfd)) {
    if (cd <= 0) {
      throw new Error('actual number of days in the period negative or zero');
    }

    for (let i = 0; i < cf.length; i++) {
      if (cfd[i] < 0) {
        throw new Error('number of days negative or zero');
      }

      w[i] = 1 - cfd[i] / cd;
    }

    let totalWeightedCashFlow = 0; //total weighted cash flows
    for (let i = 0; i < cf.length; i++) {
      totalWeightedCashFlow += w[i] * cf[i];
    }

    let totalNetCashFlow = 0; //total net cash flows
    for (let i = 0; i < cf.length; i++) {
      totalNetCashFlow += cf[i];
    }

    md = (ev - bv - totalNetCashFlow) / (bv + totalWeightedCashFlow);
  }

  return md;
}

export { mdietz };
