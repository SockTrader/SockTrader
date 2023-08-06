import { TestScheduler } from 'rxjs/testing';
import { localExchangeCandlesMock as candleMock } from '../../__mocks__/localExchange.mock';
import { TestStrategy } from '../../__mocks__/testStrategy.mock';
import {
  Trade,
  Order,
  OrderSide,
  OrderStatus,
  OrderType,
} from '../../interfaces';
import { LocalExchange } from './localExchange';
import { of, switchMapTo, tap } from 'rxjs';

describe('LocalExchange common', () => {
  const candleMockSet1 = [candleMock[0], candleMock[1], candleMock[2]];
  const candleMockSet2 = [candleMock[0]];

  let strategy: TestStrategy<LocalExchange>;
  let scheduler: TestScheduler;
  let instance: LocalExchange;

  beforeEach(() => {
    instance = new LocalExchange();
    strategy = new TestStrategy(instance);
    scheduler = new TestScheduler((received, expected) => {
      expect(received).toEqual(expected);
    });
  });

  afterEach(() => {
    strategy.onStop();
  });

  it('#LocalExchange should listen to candle events', () => {
    instance.addCandles(['BTC', 'USDT'], candleMockSet1);

    scheduler.run(({ expectObservable }) => {
      expectObservable(instance.candles('BTCUSDT')).toBe('(abc)', {
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

  it('#LocalExchange should listen to multiple candle events simultaneously', () => {
    instance.addCandles(['ETH', 'USDT'], candleMockSet1);
    instance.addCandles(['BTC', 'USDT'], candleMockSet2);

    scheduler.run(({ expectObservable }) => {
      expectObservable(instance.candles('BTCUSDT')).toBe('(a)', {
        a: expect.objectContaining({ start: new Date('2020-02-24T11:00:00') }),
      });

      expectObservable(instance.candles('ETHUSDT')).toBe('(abc)', {
        a: expect.objectContaining({ start: new Date('2020-02-24T11:00:00') }),
        b: expect.objectContaining({ start: new Date('2020-02-24T12:00:00') }),
        c: expect.objectContaining({ start: new Date('2020-02-24T13:00:00') }),
      });
    });
  });

  it('#LocalExchange should provide a Trades stream', () => {
    instance.addCandles(['BTC', 'USDT'], candleMock);
    instance.setAssets([
      { asset: 'USDT', quantity: 10000 },
      { asset: 'BTC', quantity: 1 },
    ]);

    scheduler.run(({ expectObservable }) => {
      const src$ = of(null).pipe(
        tap(() => strategy.onStart('BTCUSDT')),
        switchMapTo(instance.trades$)
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

  it('#LocalExchange should provide an Order stream', () => {
    instance.addCandles(['BTC', 'USDT'], candleMock);
    instance.setAssets([
      { asset: 'USDT', quantity: 10000 },
      { asset: 'BTC', quantity: 1 },
    ]);

    scheduler.run(({ expectObservable }) => {
      const src$ = of(null).pipe(
        tap(() => strategy.onStart('BTCUSDT')),
        switchMapTo(instance.orders$)
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
