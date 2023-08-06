/**
 * @method isArray
 * @summary validate if variable is of type array
 * @description validate if variable is of type array
 *
 * @param {any} x
 * @returns {x is array}
 */
export function isArray<T>(x: unknown): x is T[] {
  return Array.isArray(x);
}
