import { add } from 'date-fns';
import { TestScheduler } from 'rxjs/testing';
import { Candle } from '../interfaces';
import {
  aggregateCandles,
  combineCandleUpdates,
  getStartOfNextInterval,
} from './aggregateCandles';

const createCandles = (amount: number, gap: number) =>
  Array.from({ length: amount }).map((val, idx) => ({
    open: 10,
    high: 10,
    low: 10,
    close: 10,
    volume: 10,
    start: add(new Date(), { minutes: idx * gap }),
  }));

describe('getStartOfNextInterval', () => {
  it('should round to the next minute', () => {
    const date = getStartOfNextInterval(
      new Date('2021-12-01T12:05:10'),
      1,
      'minutes'
    );
    expect(date).toEqual(new Date('2021-12-01T12:06:00'));
  });

  it('should not round to the next hour if given date is at the start of an interval (with compression 1)', () => {
    const date = getStartOfNextInterval(
      new Date('2021-12-01T12:00:00'),
      1,
      'hours'
    );
    expect(date).toEqual(new Date('2021-12-01T12:00:00'));
  });

  it('should not round to the next hour if given date is at the start of an interval (with compression 2)', () => {
    const date = getStartOfNextInterval(
      new Date('2021-12-01T13:00:00'),
      2,
      'hours'
    );
    expect(date).toEqual(new Date('2021-12-01T13:00:00'));
  });

  it('should round to the next hour', () => {
    const date = getStartOfNextInterval(
      new Date('2021-12-01T12:05:00'),
      1,
      'hours'
    );
    expect(date).toEqual(new Date('2021-12-01T13:00:00'));
  });

  it('should round to the next 2 hours', () => {
    const date = getStartOfNextInterval(
      new Date('2021-12-01T11:05:00'),
      2,
      'hours'
    );
    expect(date).toEqual(new Date('2021-12-01T13:00:00'));
  });

  it('should round to the next day', () => {
    const date = getStartOfNextInterval(
      new Date('2021-12-01T12:05:00'),
      1,
      'days'
    );
    expect(date).toEqual(new Date('2021-12-02T00:00:00'));
  });
});

describe('Combine candles', () => {
  const baseCandle: Candle = {
    open: 10,
    high: 11,
    low: 5,
    close: 11,
    volume: 1000,
    start: new Date('2021-12-01T12:00:00'),
  };

  const updateCandle: Candle = {
    ...baseCandle,
    open: 11,
    high: 12,
    low: 4,
    close: 4,
    volume: 1000,
    start: new Date('2021-12-01T12:05:00'),
  };

  it('should use candle start from the base candle', () => {
    const candle = combineCandleUpdates(baseCandle, updateCandle);
    expect(candle.start).toEqual(new Date('2021-12-01T12:00:00'));
  });

  it('should sum the volume of the candles', () => {
    const candle = combineCandleUpdates(baseCandle, updateCandle);
    expect(candle.volume).toEqual(2000);
  });

  it('should return the close value of the update candle', () => {
    const candle = combineCandleUpdates(baseCandle, updateCandle);
    expect(candle.close).toEqual(4);
  });

  it('should return the open value of the start candle', () => {
    const candle = combineCandleUpdates(baseCandle, updateCandle);
    expect(candle.open).toEqual(10);
  });

  it.concurrent.each`
    base          | update                                       | expected
    ${baseCandle} | ${{ ...updateCandle, high: 13 }} | ${13}
    ${baseCandle} | ${updateCandle}                              | ${12}
  `(
    'should return ($expected) as highest value',
    ({ base, update, expected }) => {
      const candle = combineCandleUpdates(base, update);
      expect(candle.high).toEqual(expected);
    }
  );

  it.concurrent.each`
    base          | update                                     | expected
    ${baseCandle} | ${{ ...updateCandle, low: 6 }} | ${5}
    ${baseCandle} | ${updateCandle}                            | ${4}
  `(
    'should return ($expected) as lowest value',
    ({ base, update, expected }) => {
      const candle = combineCandleUpdates(base, update);
      expect(candle.low).toEqual(expected);
    }
  );
});

describe('AggregateCandles', () => {
  let scheduler: TestScheduler;

  jest.useFakeTimers();
  jest.setSystemTime(new Date('2021-12-01T11:40:00'));

  beforeEach(() => {
    scheduler = new TestScheduler((received, expected) => {
      expect(received).toEqual(expected);
    });
  });

  it('should aggregate 5 minute candles in 10 minute candles', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const candles = createCandles(10, 5);
      const candles$ = cold<Candle>(
        '-0-1-2-3-4-5-6-7-8|',
        candles as never
      ).pipe(aggregateCandles(10, 'minutes'));
      const expected = '             ---1---2---3---4--|';

      expectObservable(candles$).toBe(expected, {
        1: expect.objectContaining({
          volume: 20,
          start: new Date('2021-12-01T11:40:00'),
        }),
        2: expect.objectContaining({
          volume: 20,
          start: new Date('2021-12-01T11:50:00'),
        }),
        3: expect.objectContaining({
          volume: 20,
          start: new Date('2021-12-01T12:00:00'),
        }),
        4: expect.objectContaining({
          volume: 20,
          start: new Date('2021-12-01T12:10:00'),
        }),
      });
    });
  });

  it('should aggregate 20 minute candles in 1 hour candles', () => {
    jest.setSystemTime(new Date('2021-12-01T12:00:00'));

    scheduler.run(({ cold, expectObservable }) => {
      const candles = createCandles(10, 20);
      const candles$ = cold<Candle>('-0-1-2-3-4-5-6-7|', candles as never).pipe(
        aggregateCandles(1, 'hours')
      );
      const expected = '             -----1-----2----|';

      expectObservable(candles$).toBe(expected, {
        1: expect.objectContaining({
          volume: 30,
          start: new Date('2021-12-01T12:00:00'),
        }),
        2: expect.objectContaining({
          volume: 30,
          start: new Date('2021-12-01T13:00:00'),
        }),
      });
    });
  });

  it('should throw if target compression is not dividable by candle interval', () => {
    jest.setSystemTime(new Date('2021-12-01T12:00:00'));

    scheduler.run(({ cold, expectObservable }) => {
      const candles = createCandles(10, 60 * 10);
      const candles$ = cold<Candle>('-0-1-2-3-4-5-6-7|', candles as never).pipe(
        aggregateCandles(1, 'days')
      );
      const expected = '             ---#';

      expectObservable(candles$).toBe(
        expected,
        null,
        '1 day(s) is not dividable by 10H'
      );
    });
  });

  it('should drop incomplete candles before start of aggregated candle', () => {
    jest.setSystemTime(new Date('2021-12-01T12:20:00'));

    scheduler.run(({ cold, expectObservable }) => {
      const candles = createCandles(10, 20);
      const candles$ = cold<Candle>(
        '-0-1-2-3-4-5-6-7-8|',
        candles as never
      ).pipe(aggregateCandles(1, 'hours'));
      const expected = '             ---------1-----2--|';

      expectObservable(candles$).toBe(expected, {
        1: expect.objectContaining({
          volume: 30,
          start: new Date('2021-12-01T13:00:00'),
        }),
        2: expect.objectContaining({
          volume: 30,
          start: new Date('2021-12-01T14:00:00'),
        }),
      });
    });
  });
});
