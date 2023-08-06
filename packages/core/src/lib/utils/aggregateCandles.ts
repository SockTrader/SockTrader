import {
  add,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  set,
} from 'date-fns';
import { Observable, OperatorFunction } from 'rxjs';
import { Candle } from '../interfaces';

type TimeFrame = 'days' | 'hours' | 'minutes';
type diffFn = (dateLeft: Date, dateRight: Date) => number;

const diffFns: Record<TimeFrame, diffFn> = {
  minutes: differenceInMinutes,
  hours: differenceInHours,
  days: differenceInDays,
};

export const getIntervalInSeconds = (
  compression: number,
  timeframe: TimeFrame
): number => {
  switch (timeframe) {
    case 'minutes':
      return compression * 60;
    case 'hours':
      return compression * 3600;
    case 'days':
      return compression * 3600 * 24;
    default:
      throw new Error(`Timeframe '${timeframe}' not supported`);
  }
};

export const getStartOfNextInterval = (
  date: Date,
  compression: number,
  timeframe: TimeFrame,
  offset = 1
): Date => {
  const intervalInSeconds: number = getIntervalInSeconds(
    compression,
    timeframe
  );
  let nextInterval: Date | null = null;

  if (timeframe === 'minutes') {
    nextInterval = add(set(date, { seconds: 0, milliseconds: 0 }), {
      minutes: compression,
    });
  } else if (timeframe === 'hours') {
    const hours = compression - ((date.getHours() - offset) % compression);
    nextInterval = add(set(date, { minutes: 0, seconds: 0, milliseconds: 0 }), {
      hours,
    });
  } else if (timeframe === 'days') {
    nextInterval = add(
      set(date, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
      { days: compression }
    );
  } else {
    throw new Error(`Timeframe '${timeframe}' not supported`);
  }

  const diff = Math.abs(date.getTime() - nextInterval.getTime());
  return diff === 0 || diff === intervalInSeconds * 1000 ? date : nextInterval;
};

export const combineCandleUpdates = (
  prevCandle: Candle | null,
  newCandle: Candle
): Candle => {
  return prevCandle == null
    ? newCandle
    : {
        start: prevCandle.start,
        open: prevCandle.open,
        high: Math.max(
          newCandle.high,
          prevCandle.high,
          Number.MIN_SAFE_INTEGER
        ),
        low: Math.min(newCandle.low, prevCandle.low, Number.MAX_SAFE_INTEGER),
        close: newCandle.close,
        volume: prevCandle.volume + newCandle.volume,
      };
};

export const aggregateCandles = (
  compression: number,
  timeframe: TimeFrame,
  intervalInSeconds?: number
): OperatorFunction<Candle, Candle> => {
  return (source: Observable<Candle>): Observable<Candle> => {
    const diffFn: diffFn = diffFns[timeframe];

    let candleInterval: number | undefined = intervalInSeconds;
    let firstCandle: Candle | null;
    let candle: Candle | null;
    let warmup = true;

    return new Observable<Candle>((subscriber) => {
      source.subscribe({
        next(c) {
          if (firstCandle && candleInterval == null) {
            // automatically determine candle interval
            candleInterval = differenceInSeconds(c.start, firstCandle.start);
          }

          if (
            candleInterval != null &&
            getIntervalInSeconds(compression, timeframe) % candleInterval != 0
          ) {
            subscriber.error(
              `${compression} ${
                timeframe.slice(0, -1) + '(s)'
              } is not dividable by ${candleInterval / 3600}H`
            );
          }

          if (firstCandle == null) firstCandle = c;

          if (warmup) {
            if (
              c.start.getTime() <
              getStartOfNextInterval(c.start, compression, timeframe).getTime()
            ) {
              return;
            } else {
              warmup = false;
            }
          }

          candle = combineCandleUpdates(candle, c);

          if (candleInterval == null) return;
          if (
            diffFn(add(c.start, { seconds: candleInterval }), candle.start) >=
            compression
          ) {
            subscriber.next(candle);
            candle = null;
          }
        },
        complete() {
          subscriber.complete();
        },
      });
    });
  };
};
