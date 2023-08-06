import { fix } from '../math/fix';

/**
 * @method colon
 * @summary Array of numbers from L to U with step S
 * @description Array of numbers from L to U with step S
 *
 * @param  {number} l lower value of the array
 * @param  {number} u upper value of the array
 * @param  {number} s step value (def: 1)
 * @return {array}
 *
 * @example
 * colon(1,10,1);
 * // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 *
 * colon(10,1,1);
 * //  []
 *
 * colon(-5,5,2);
 * // [-5, -3, -1, 1, 3, 5]
 *
 * colon(-7,14,2);
 * // [-7, -5, -3, -1, 1, 3, 5, 7, 9, 11, 13]
 */
export function colon(l: number, u: number, s = 1): number[] {
  if (s === 0 || (s > 0 && l > u) || (s < 0 && l < u)) {
    return [];
  }

  const t = fix((u - l) / s);
  const out = [l];
  for (let i = 1; i <= t; i++) {
    out[i] = out[i - 1] + s;
  }

  return out;
}
