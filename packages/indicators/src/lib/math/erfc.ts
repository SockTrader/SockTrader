/**
 * @method erfc
 * @summary Complementary error function
 * @description Complementary error function
 *
 * erfc(x) = 2/sqrt(pi) * integral from x to inf of exp(-t^2) dt
 * erfc(x) = 1 - erf(x)
 *
 * @param  {number} x must be real
 * @return {number}
 *
 * @example
 * erfc(0.5);
 * // 0.47950009227675744
 */
export function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (0.5 * z + 1);
  const a1 = t * 0.17087277 + -0.82215223;
  const a2 = t * a1 + 1.48851587;
  const a3 = t * a2 + -1.13520398;
  const a4 = t * a3 + 0.27886807;
  const a5 = t * a4 + -0.18628806;
  const a6 = t * a5 + 0.09678418;
  const a7 = t * a6 + 0.37409196;
  const a8 = t * a7 + 1.00002368;
  const a9 = t * a8;
  const a10 = -z * z - 1.26551223 + a9;
  let a = t * Math.exp(a10);

  if (x < 0) {
    a = 2 - a;
  }

  return a;
}
