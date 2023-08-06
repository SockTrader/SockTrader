export enum Sort {
  ascending,
  descending,
}

/**
 * @method sort
 * @summary Sort array elements in ascending/descending order
 * @description Sort array elements in ascending/descending order.
 *
 * @param   {array} x array of elements
 * @param   {string} mode sorting direction, 'ascend' (default) or 'descend'
 * @return  {array}
 *
 * @example
 * sort([0,5,-1,3,-4,9,0], Sort.ascending);
 * // [ -4, -1, 0, 0, 3, 5, 9 ]
 */
export function sort(x: number[], mode: Sort = Sort.ascending) {
  const sort =
    mode === Sort.ascending
      ? (a: number, b: number) => a - b
      : (a: number, b: number) => b - a;

  return x.sort(sort);
}
