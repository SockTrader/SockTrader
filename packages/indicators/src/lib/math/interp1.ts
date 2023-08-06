import { isNumber } from '../utils';

function findNeighbour(value: number, arr: number[]) {
  let dist = Number.MAX_VALUE,
    idx = -1;
  for (let i = 0; i < arr.length; i++) {
    const newdist = value - arr[i];
    if (newdist > 0 && newdist < dist) {
      dist = newdist;
      idx = i;
    }
  }
  return idx;
}

/**
 * @method interp1
 * @summary Linear interpolation
 * @description Linear interpolation. Returns the 1-D value of Y, given Xi query points.
 *
 * @param  {array} x sample points
 * @param  {array} y corresponding values of sample points
 * @param  {number|number[]} xnew query points. For values outside [min(X),max(X)] NaN is returned.
 * @return {array}
 *
 * @example
 * var x = [1,2,3,4,5,6];
 * var y = [2,4,6,8,10,12];
 * var xnew = [2,4,6];
 *
 * interp1(x,y,xnew);
 * // [ 4, 8, 12 ]
 */
function interp1(x: number[], y: number[], xnew: number): number;
function interp1(x: number[], y: number[], xnew: number[]): number[];
function interp1(
  x: number[],
  y: number[],
  xnew: number | number[]
): number | number[] {
  if (x.length !== y.length) {
    throw new Error('input dimension mismatch');
  }

  if (isNumber(xnew)) {
    xnew = [xnew];
  }

  const ynew = new Array(xnew.length),
    n = x.length,
    dx = new Array(n),
    dy = new Array(n),
    slope = new Array(n),
    intercept = new Array(n);

  for (let i = 0; i < n; i++) {
    if (i < n - 1) {
      dx[i] = x[i + 1] - x[i];
      dy[i] = y[i + 1] - y[i];
      slope[i] = dy[i] / dx[i];
      intercept[i] = y[i] - x[i] * slope[i];
    } else {
      dx[i] = dx[i - 1];
      dy[i] = dy[i - 1];
      slope[i] = slope[i - 1];
      intercept[i] = intercept[i - 1];
    }
  }

  for (let j = 0; j < xnew.length; j++) {
    if (xnew[j] < Math.min(...x) || xnew[j] > Math.max(...x)) {
      ynew[j] = NaN;
    } else {
      const idx = findNeighbour(xnew[j], x);
      ynew[j] = slope[idx] * xnew[j] + intercept[idx];
    }
  }

  if (ynew.length === 1) {
    return ynew[0];
  } else {
    return ynew;
  }
}

export { interp1 };
