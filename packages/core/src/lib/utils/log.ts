import config from 'config';
import { OperatorFunction, tap } from 'rxjs';

export enum LOG {
  error = 'error',
  warn = 'warn',
  info = 'info',
  verbose = 'verbose',
  debug = 'debug',
  silly = 'silly',
}

export const LEVELS = [
  LOG.error,
  LOG.warn,
  LOG.info,
  LOG.verbose,
  LOG.debug,
  LOG.silly,
] as const;

export const log = <T>(
  tag: string,
  level: LOG = LOG.info
): OperatorFunction<T, any> => {
  return (source) =>
    source.pipe(
      tap((v) => {
        if (!config.get('debug')) return;

        const lvlIdx = LEVELS.findIndex((l) => l === level);
        const configIdx = LEVELS.findIndex((l) => l === config.get('debug'));

        if (configIdx >= lvlIdx) {
          console.log(`\x1b[33m${tag}\x1b[0m: ${JSON.stringify(v)}`);
        }
      })
    );
};
