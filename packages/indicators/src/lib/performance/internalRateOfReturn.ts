import { colon } from '../utils/colon';

/**
 * @method internalRateOfReturn
 * @summary Internal rate of return on an investment based on a series of periodic cash flows
 * @description Calculates the internal rate of return on an investment
 * based on a series of regularly/irregularly periodic cash flows.
 *
 * @param  {array} cf income or payments associated with the investment. Must contain at least one negative and one positive cash flow to calculate rate of return, and the first amount must be negative
 * @param  {array} cfd number of calendar days from the beginning of the period that cash flow occurs
 * @param  {number} cd total number of calendar days in the measurement period
 * @param  {number} guess estimate for what the internal rate of return will be (def: 0.1)
 * @return {number}
 *
 * @example
 * //Simple IRR
 * internalRateOfReturn([250000,25000,-10000,-285000]);
 * // 0.024712563094781776
 *
 * internalRateOfReturn([74.2,37.1,-104.4],[0,1,2],2);
 * // -0.07410820570460687
 *
 * //Modified IRR
 * internalRateOfReturn([250000,25000,-10000,-285000],[0,45,69,90],90);
 * // 0.07692283872311274
 *
 * internalRateOfReturn([74.2,37.1,-104.4],[0,14,31],31);
 * // -0.07271456460699813
 */
export const internalRateOfReturn = function (
  cf: number[],
  cfd?: number[],
  cd = 1,
  guess = 0.1
) {
  const _npv = function (
    cf: number[],
    cfd: number[],
    cd: number,
    guess: number
  ) {
    let npv = 0;
    for (let i = 0; i < cf.length; i++) {
      npv += cf[i] / Math.pow(1 + guess, cfd[i] / cd);
    }
    return npv;
  };

  const _npvd = function (
    cf: number[],
    cfd: number[],
    cd: number,
    guess: number
  ) {
    let npv = 0;
    for (let i = 0; i < cf.length; i++) {
      npv -= ((cfd[i] / cd) * cf[i]) / Math.pow(1 + guess, cfd[i] / cd);
    }
    return npv;
  };

  if (!cfd) cfd = colon(0, cf.length - 1, 1);

  const maxeps = 1e-6;
  const maxiter = 50;
  let cnt = 0;
  let rate = guess;
  let newrate = 0;
  let epsrate = 0;
  let npv = 0;
  let cntv = true;

  do {
    npv = _npv(cf, cfd, cd, rate);
    newrate = rate - npv / _npvd(cf, cfd, cd, rate);
    epsrate = Math.abs(newrate - rate);
    rate = newrate;
    cntv = epsrate > maxeps && Math.abs(npv) > maxeps;
  } while (cntv && cnt++ < maxiter);

  if (cntv) {
    throw new Error('number error');
  }

  return rate;
};
