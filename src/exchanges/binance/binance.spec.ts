//@ts-ignore
import { __emitUserDataStreamEvents, CandleChartInterval, ExecutionReport } from 'binance-api-node';
import { RunHelpers, TestScheduler } from 'rxjs/testing';
import { __setCandles } from '../../../__mocks__/binance-api-node';
import { binanceCandlesMock } from '../../../__mocks__/binance.mock';
import { mockCancelLimitBuyOrder, mockCreateLimitBuyOrder, mockCreateMarketSellOrder, mockFillLimitBuyOrder, mockFillMarketSellOrder, mockPartiallyFilledLimitBuyOrderPart1 } from '../../../__mocks__/binanceExecutionReport.mock';
import { Order, OrderSide, OrderStatus, OrderType } from '../../core/order.interfaces';
import { feedObservable } from '../../helpers/feedObservable.helper';
import { exchangeTestSuite } from '../exchanges.spec';
import Binance from './binance';

jest.mock('binance-api-node');

describe('Generic exchange test suite', () => {
  const suite = exchangeTestSuite('BinanceExchange', Binance);
  const candleMockSet1 = [binanceCandlesMock[0], binanceCandlesMock[1], binanceCandlesMock[2]];
  const candleMockSet2 = [binanceCandlesMock[0]];

  suite.testCandles(exchange => {
    __setCandles('BTCUSDT', <CandleChartInterval>'1h', candleMockSet1);

    return exchange.candles({ symbol: 'BTCUSDT', interval: <CandleChartInterval>'1h' });
  });

  suite.testCandleSeries(exchange => {
    __setCandles('ETHUSDT', <CandleChartInterval>'1h', candleMockSet1);
    __setCandles('BTCUSDT', <CandleChartInterval>'1h', candleMockSet2);

    return [
      exchange.candles({ symbol: 'BTCUSDT', interval: <CandleChartInterval>'1h' }),
      exchange.candles({ symbol: 'ETHUSDT', interval: <CandleChartInterval>'1h' }),
    ];
  });

  // @todo
  //suite.testTradeStream(() => {
  //  __setCandles('BTCUSDT', <CandleChartInterval>'1h', binanceCandlesMock);
  //});

  // @todo
  //suite.testOrderStream(() => {
  //  __setCandles('BTCUSDT', <CandleChartInterval>'1h', binanceCandlesMock);
  //});
});

describe('Binance', () => {
  let binance: Binance;
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((received, expected) => {
      expect(received).toEqual(expected);
    });
  });

  it('Should provide an Order stream', () => {
    scheduler.run(({ cold, expectObservable, }) => {
      binance = new Binance();

      const detailsVisibleMarble = 'a-b';
      const triggerMarble = 'a-b';

      const toggleEvents$ = cold(triggerMarble, {
        a: mockCreateLimitBuyOrder(),
        b: mockCancelLimitBuyOrder()
      });

      const src$ = feedObservable(toggleEvents$, __emitUserDataStreamEvents, binance.orders$);

      expectObservable(src$).toBe(detailsVisibleMarble, {
        a: expect.objectContaining(<Partial<ExecutionReport>>{ side: 'BUY', status: 'NEW' }),
        b: expect.objectContaining(<Partial<ExecutionReport>>{ side: 'BUY', status: 'CANCELED' }),
      });
    });
  });

  // @TODO this test scenario should be refactored
  // Note: it is not convenient to test this scenario by using the user data stream.
  // since a market order should be triggered by a binance.sell and binance.buy action instead of a UserDataStreamEvent
  //
  // We should extract Trade & Order stream updates directly from the OrderResponse for MARKET orders.
  // Since Binance is not returning a proper response in the UserDataStreamEvent for MARKET orders.
  // eg: it's missing correct price data and individual trades
  xit('Should filter out trade events in the Order stream', () => {
    scheduler.run(({ cold, expectObservable }: RunHelpers) => {
      binance = new Binance();

      const toggleEvents$ = cold('a', {
        a: mockFillMarketSellOrder(),
        b: mockPartiallyFilledLimitBuyOrderPart1(),
      });

      const src$ = feedObservable(toggleEvents$, __emitUserDataStreamEvents, binance.orders$);

      expectObservable(src$).toBe('a', {
        // FILL events are allowed in orders$ stream
        a: expect.objectContaining(<Partial<Order>>{
          price: 0,
          quantity: 0.00216,
          side: <OrderSide>'SELL',
          status: <OrderStatus>'FILLED',
          type: <OrderType>'MARKET',
          symbol: 'BTCUSDT',
        }),
      });
    });
  });

  // @TODO this test scenario should be refactored
  // Note: it is not convenient to test this scenario by using the user data stream.
  // since a market order should be triggered by a binance.sell and binance.buy action instead of a UserDataStreamEvent
  //
  // We should extract Trade & Order stream updates directly from the OrderResponse for MARKET orders.
  // Since Binance is not returning a proper response in the UserDataStreamEvent for MARKET orders.
  // eg: it's missing correct price data and individual trades
  xit('Should provide a Trades stream', () => {
    scheduler.run(({ cold, expectObservable }: RunHelpers) => {
      binance = new Binance();

      const detailsVisibleMarble = 'a-b';
      const triggerMarble = 'a-b';

      const toggleEvents$ = cold(triggerMarble, {
        a: mockFillLimitBuyOrder(),
        b: mockFillMarketSellOrder()
      });

      const src$ = feedObservable(toggleEvents$, __emitUserDataStreamEvents, binance.trades$);

      expectObservable(src$).toBe(detailsVisibleMarble, {
        a: expect.objectContaining(<Partial<ExecutionReport>>{ side: 'BUY', status: 'FILLED' }),
        b: expect.objectContaining(<Partial<ExecutionReport>>{ side: 'SELL', status: 'FILLED' }),
      });
    });
  });

  it('Should filter out order events in the Trades stream', () => {
    scheduler.run(({ cold, expectObservable }: RunHelpers) => {
      binance = new Binance();

      const toggleEvents$ = cold('a', {
        a: mockCreateMarketSellOrder(),
      });

      const src$ = feedObservable(toggleEvents$, __emitUserDataStreamEvents, binance.trades$);

      expectObservable(src$).toBe('', {});
    });
  });
});
