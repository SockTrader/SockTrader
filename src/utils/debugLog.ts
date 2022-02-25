import { MonoTypeOperatorFunction, pipe, tap } from 'rxjs';
import config from 'config';

export const debugLog = <T>(tag: string): MonoTypeOperatorFunction<T> => {
  return pipe(tap(v => {
    if (config.get('debug')) {
      console.log(`\x1b[33m${tag}\x1b[0m : ${JSON.stringify(v)}`);
    }
  }));
}
