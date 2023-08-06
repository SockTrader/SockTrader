import { erfc } from './erfc';

/**
 * @method  erfcinv
 * @summary Inverse complementary error function
 * @description Inverse complementary error function
 *
 * It satisfies y = erfc(x) for 2 >= y >= 0 with -Inf <= x <= Inf
 *
 * @param  {number} y real value in range [2,0]
 * @return {number}
 *
 * @example
 * erfcinv(1.5);
 * // -0.476936236121904
 */
export function erfcinv(y: number): number {
  if (y >= 2) {
    return -Infinity;
  }
  if (y <= 0) {
    return Infinity;
  }

  let z = 0;
  const _y = y < 1 ? y : 2 - y;
  const t = Math.sqrt(-2 * Math.log(_y / 2));
  let x =
    -0.70711 *
    ((2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481)) - t);
  for (let i = 0; i < 2; i++) {
    z = erfc(x) - _y;
    //eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    x += z / (1.12837916709551257 * Math.exp(-x * x) - x * z);
  }
  return y < 1 ? x : -x;
}
