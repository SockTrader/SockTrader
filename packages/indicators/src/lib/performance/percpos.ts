/**
 * @method percpos
 * @summary Percentage of positive values in array
 * @description Percentage of positive values in array
 *
 * @param  {array} x array of elements
 * @return {number}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 *
 * percpos(x);
 * // 0.8
 */
export function percpos(x: number[]): number {
  return (
    x.reduce((prev, current) => {
      return current >= 0 ? prev + 1 : prev;
    }, 0) / x.length
  );
}
