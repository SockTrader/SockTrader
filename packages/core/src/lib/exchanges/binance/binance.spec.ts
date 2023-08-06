//@ts-ignore
import { __emitUserDataStreamEvents, ExecutionReport } from 'binance-api-node';
import {
  mockCancelLimitBuyOrder,
  mockCreateLimitBuyOrder,
  mockCreateMarketSellOrder,
} from './__mocks__/binanceExecutionReport.mock';
import { RunHelpers, TestScheduler } from 'rxjs/testing';
import { feedObservable } from '../../utils';
import { Binance } from './binance';

describe('Binance', () => {
  let binance: Binance;
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((received, expected) => {
      expect(received).toEqual(expected);
    });
  });

  it('Should provide an Order stream', () => {
    scheduler.run(({ cold, expectObservable }) => {
      binance = new Binance();

      const detailsVisibleMarble = 'a-b';
      const triggerMarble = 'a-b';

      const toggleEvents$ = cold(triggerMarble, {
        a: mockCreateLimitBuyOrder(),
        b: mockCancelLimitBuyOrder(),
      });

      const src$ = feedObservable(
        toggleEvents$,
        __emitUserDataStreamEvents,
        binance.orders$
      );

      expectObservable(src$).toBe(detailsVisibleMarble, {
        a: expect.objectContaining(<Partial<ExecutionReport>>{
          side: 'BUY',
          status: 'NEW',
        }),
        b: expect.objectContaining(<Partial<ExecutionReport>>{
          side: 'BUY',
          status: 'CANCELED',
        }),
      });
    });
  });

  it('Should filter out order events in the Trades stream', () => {
    scheduler.run(({ cold, expectObservable }: RunHelpers) => {
      binance = new Binance();

      const toggleEvents$ = cold('a', {
        a: mockCreateMarketSellOrder(),
      });

      const src$ = feedObservable(
        toggleEvents$,
        __emitUserDataStreamEvents,
        binance.trades$
      );

      expectObservable(src$).toBe('', {});
    });
  });
});
