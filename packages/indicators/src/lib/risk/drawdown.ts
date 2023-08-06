import { plus } from '../math';
import { cumprod } from '../math/cumprod';
import { log } from '../math/log';

export enum Mode {
  return,
  geometric,
}

/**
 * @method drawdown
 * @summary Drawdown
 * @description Drawdowon from Peak.Any continuous losing return period.
 * Return drawdown from peak and time to recovery array.
 *
 * Returns an object with:
 *
 * dd (drawdown array)
 * ddrecov (drawdown recovery index)
 * maxdd (max drawdown)
 * maxddrecov (max drawdown recovery period): [start period, end period]
 *
 * @param  {array} x asset/portfolio returns
 * @param  {string} mode drawdown calculation. 'return','geometric' (def: 'return')
 * @return {object}
 *
 * @example
 * var x = [0.003,0.026,0.015,-0.009,0.014,0.024,0.015,0.066,-0.014,0.039];
 *
 * drawdown(x);
 * // { dd: [ 0, 0, 0, 0.009, 0, 0, 0, 0, 0.014, 0 ], ddrecov: [ 0, 0, 0, 4, 0, 0, 0, 0, 9, 0 ],
 * //   maxdd: 0.014, maxddrecov: [ 8, 9 ] }
 */
export function drawdown(x: number[], mode = Mode.return) {
  let _a;
  if (mode === Mode.return) {
    _a = cumprod(plus(x, 1));
  } else if (mode === Mode.geometric) {
    _a = log(cumprod(plus(x, 1)));
  } else {
    throw new Error('unknown drawdown mode');
  }

  const _dd = new Array(_a.length).fill(0);
  const _recov = new Array(_a.length).fill(0);
  const _maxddidx = [1, _a.length];
  const _cdd = [];
  const t = 0;
  _cdd[t] = 0;

  let highest = _a[0];
  let highestidx = 1;
  let _maxdd = 0;

  for (let i = 0; i < _a.length; i++) {
    if (highest <= _a[i]) {
      highest = _a[i];
      highestidx = i + 1;
    }

    if (mode === Mode.return) {
      _dd[i] = (highest - _a[i]) / highest;
    } else if (mode === Mode.geometric) {
      _dd[i] = highest - _a[i];
    }

    if (_dd[i] !== 0) {
      _recov[i] = i + 1;
    }

    if (_dd[i] > _maxdd) {
      _maxdd = _dd[i];
      _maxddidx[0] = highestidx;
      _maxddidx[1] = i + 1;
    }
  }

  return { dd: _dd, ddrecov: _recov, maxdd: _maxdd, maxddrecov: _maxddidx };
}
