import {
  //@ts-ignore
  __emitUserDataStreamEvents,
  CandleChartInterval,
} from 'binance-api-node';
import { TestScheduler } from 'rxjs/testing';
import { __setCandles } from '../../__mocks__/binance-api-node';
import { TestStrategy } from '../../__mocks__/testStrategy.mock';
import {
  Order,
  OrderSide,
  OrderStatus,
  OrderType,
  Trade,
} from '../../interfaces';
import { feedObservable } from '../../utils';
import { binanceCandlesMock } from './__mocks__/binanceCandles.mock';
import {
  mockCommonLimitFilledBuyOrder,
  mockCommonLimitFilledSellOrder,
  mockCommonLimitNewBuyOrder,
  mockCommonLimitNewSellOrder,
  mockCommonMarketBuyOrderResponse,
  mockCommonMarketSellOrderResponse,
} from './__mocks__/binanceCommon.mock';
import { Binance } from './binance';

describe('Binance common', () => {
  const candleMockSet1 = [
    binanceCandlesMock[0],
    binanceCandlesMock[1],
    binanceCandlesMock[2],
  ];
  const candleMockSet2 = [binanceCandlesMock[0]];

  let strategy: TestStrategy<Binance>;
  let scheduler: TestScheduler;
  let exchange: Binance;

  beforeEach(() => {
    exchange = new Binance();
    strategy = new TestStrategy(exchange);
    scheduler = new TestScheduler((received, expected) => {
      expect(received).toEqual(expected);
    });
  });

  afterEach(() => {
    strategy.onStop();
  });

  it('#Binance should listen to candle events', () => {
    __setCandles('BTCUSDT', <CandleChartInterval>'1h', candleMockSet1);
    const candles$ = exchange.candles({
      symbol: 'BTCUSDT',
      interval: <CandleChartInterval>'1h',
    });

    scheduler.run(({ expectObservable }) => {
      expectObservable(candles$).toBe('(abc)', {
        a: {
          open: 9755.86,
          high: 9850.26,
          low: 9676.22,
          close: 9820.01,
          volume: 528.06,
          start: new Date('2020-02-24T11:00:00'),
        },
        b: {
          open: 9820.01,
          high: 9847.63,
          low: 9787.32,
          close: 9800,
          volume: 159,
          start: new Date('2020-02-24T12:00:00'),
        },
        c: {
          open: 9800,
          high: 9815.86,
          low: 9745,
          close: 9750.42,
          volume: 285.34,
          start: new Date('2020-02-24T13:00:00'),
        },
      });
    });
  });

  it('#Binance should listen to multiple candle events simultaneously', () => {
    __setCandles('ETHUSDT', <CandleChartInterval>'1h', candleMockSet1);
    __setCandles('BTCUSDT', <CandleChartInterval>'1h', candleMockSet2);
    const candles1 = exchange.candles({
      symbol: 'BTCUSDT',
      interval: <CandleChartInterval>'1h',
    });
    const candles2 = exchange.candles({
      symbol: 'ETHUSDT',
      interval: <CandleChartInterval>'1h',
    });

    scheduler.run(({ expectObservable }) => {
      expectObservable(candles1).toBe('(a)', {
        a: expect.objectContaining({ start: new Date('2020-02-24T11:00:00') }),
      });

      expectObservable(candles2).toBe('(abc)', {
        a: expect.objectContaining({ start: new Date('2020-02-24T11:00:00') }),
        b: expect.objectContaining({ start: new Date('2020-02-24T12:00:00') }),
        c: expect.objectContaining({ start: new Date('2020-02-24T13:00:00') }),
      });
    });
  });

  it('#Binance should provide a Trades stream', () => {
    scheduler.run(({ cold, expectObservable }) => {
      __setCandles('BTCUSDT', <CandleChartInterval>'1h', binanceCandlesMock);

      const toggleEvents$ = cold('(abcdef)', {
        a: [false, mockCommonMarketBuyOrderResponse],
        b: [false, mockCommonMarketSellOrderResponse],
        c: [true, mockCommonLimitNewBuyOrder()],
        d: [true, mockCommonLimitFilledBuyOrder()],
        e: [true, mockCommonLimitNewSellOrder()],
        f: [true, mockCommonLimitFilledSellOrder()],
      });

      const src$ = feedObservable(
        toggleEvents$,
        ([emit, eventData]) => {
          if (emit) {
            __emitUserDataStreamEvents(eventData);
          } else {
            (exchange as any)._data.extractStreamUpdatesFromMarketOrder(
              eventData
            );
          }
        },
        exchange.trades$
      );

      expectObservable(src$).toBe('(abcd)', {
        a: <Trade>{
          clientOrderId: expect.any(String),
          originalClientOrderId: undefined,
          commission: 0.001,
          commissionAsset: 'BTC',
          createTime: new Date('2020-02-24T12:00:00'),
          price: 9800,
          quantity: 1,
          side: OrderSide.BUY,
          status: OrderStatus.FILLED,
          symbol: 'BTCUSDT',
          tradeQuantity: 1,
        },
        b: <Trade>{
          clientOrderId: expect.any(String),
          originalClientOrderId: undefined,
          commission: 9.75042,
          commissionAsset: 'USDT',
          createTime: new Date('2020-02-24T13:00:00'),
          price: 9750.42,
          quantity: 1,
          side: OrderSide.SELL,
          status: OrderStatus.FILLED,
          symbol: 'BTCUSDT',
          tradeQuantity: 1,
        },
        c: <Trade>{
          clientOrderId: expect.any(String),
          originalClientOrderId: undefined,
          commission: 0.001,
          commissionAsset: 'BTC',
          createTime: new Date('2020-02-24T15:00:00'),
          price: 9700,
          quantity: 1,
          side: OrderSide.BUY,
          status: OrderStatus.FILLED,
          symbol: 'BTCUSDT',
          tradeQuantity: 1,
        },
        d: <Trade>{
          clientOrderId: expect.any(String),
          originalClientOrderId: undefined,
          commission: 9.8,
          commissionAsset: 'USDT',
          createTime: new Date('2020-02-24T16:00:00'),
          price: 9800,
          quantity: 1,
          side: OrderSide.SELL,
          status: OrderStatus.FILLED,
          symbol: 'BTCUSDT',
          tradeQuantity: 1,
        },
      });
    });
  });

  it('#Binance should provide an Order stream', () => {
    scheduler.run(({ cold, expectObservable }) => {
      __setCandles('BTCUSDT', <CandleChartInterval>'1h', binanceCandlesMock);

      const toggleEvents$ = cold('(abcdef)', {
        a: [false, mockCommonMarketBuyOrderResponse],
        b: [false, mockCommonMarketSellOrderResponse],
        c: [true, mockCommonLimitNewBuyOrder()],
        d: [true, mockCommonLimitFilledBuyOrder()],
        e: [true, mockCommonLimitNewSellOrder()],
        f: [true, mockCommonLimitFilledSellOrder()],
      });

      const src$ = feedObservable(
        toggleEvents$,
        ([emit, eventData]) => {
          if (emit) {
            __emitUserDataStreamEvents(eventData);
          } else {
            (exchange as any)._data.extractStreamUpdatesFromMarketOrder(
              eventData
            );
          }
        },
        exchange.orders$
      );

      expectObservable(src$).toBe('(abcdef)', {
        a: <Order>{
          clientOrderId: expect.any(String),
          createTime: new Date('2020-02-24T12:00:00'),
          price: 9800,
          quantity: 1,
          side: OrderSide.BUY,
          status: OrderStatus.FILLED,
          symbol: 'BTCUSDT',
          type: OrderType.MARKET,
        },
        b: <Order>{
          clientOrderId: expect.any(String),
          createTime: new Date('2020-02-24T13:00:00'),
          price: 9750.42,
          quantity: 1,
          side: OrderSide.SELL,
          status: OrderStatus.FILLED,
          symbol: 'BTCUSDT',
          type: OrderType.MARKET,
        },
        c: {
          clientOrderId: expect.any(String),
          // order.create != trade.create
          createTime: new Date('2020-02-24T14:00:00'),
          price: 9700,
          quantity: 1,
          side: OrderSide.BUY,
          status: OrderStatus.NEW,
          symbol: 'BTCUSDT',
          type: OrderType.LIMIT,
        },
        d: {
          clientOrderId: expect.any(String),
          // order.create != trade.create
          createTime: new Date('2020-02-24T14:00:00'),
          price: 9700,
          quantity: 1,
          side: OrderSide.BUY,
          status: OrderStatus.FILLED,
          symbol: 'BTCUSDT',
          type: OrderType.LIMIT,
        },
        e: {
          clientOrderId: expect.any(String),
          // order.create != trade.create
          createTime: new Date('2020-02-24T15:00:00'),
          price: 9800,
          quantity: 1,
          side: OrderSide.SELL,
          status: OrderStatus.NEW,
          symbol: 'BTCUSDT',
          type: OrderType.LIMIT,
        },
        f: {
          clientOrderId: expect.any(String),
          // order.create != trade.create
          createTime: new Date('2020-02-24T15:00:00'),
          price: 9800,
          quantity: 1,
          side: OrderSide.SELL,
          status: OrderStatus.FILLED,
          symbol: 'BTCUSDT',
          type: OrderType.LIMIT,
        },
      });
    });
  });
});
