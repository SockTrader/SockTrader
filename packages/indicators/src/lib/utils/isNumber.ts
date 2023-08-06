/**
 * @method isNumber
 * @summary validate if variable is of type number
 * @description validate if variable is of type number
 *
 * @param {any} x
 * @returns {x is number}
 */
export function isNumber(x: unknown): x is number {
  return typeof x === 'number';
}
