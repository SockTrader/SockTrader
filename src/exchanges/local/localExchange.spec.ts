import { of, switchMapTo } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { localExchangeCandlesMock as candleMock } from '../../../__mocks__/localExchange.mock';
import TestStrategy from '../../../__mocks__/testStrategy.mock';
import { OrderCommand, OrderSide, OrderStatus, OrderType } from '../../core/order.interfaces';
import { exchangeTestSuite } from '../exchanges.spec';
import LocalExchange from './localExchange';
import { OpenOrder } from './localExchange.interfaces';

describe('Generic exchange test suite', () => {
  const suite = exchangeTestSuite('LocalExchange', LocalExchange);
  const candleMockSet1 = [candleMock[0], candleMock[1], candleMock[2]];
  const candleMockSet2 = [candleMock[0]];

  suite.testCandles(exchange => {
    exchange.addCandles(['BTC', 'USDT'], candleMockSet1);
    return exchange.candles('BTCUSDT');
  });

  suite.testCandleSeries(exchange => {
    exchange.addCandles(['ETH', 'USDT'], candleMockSet1);
    exchange.addCandles(['BTC', 'USDT'], candleMockSet2);

    return [
      exchange.candles('BTCUSDT'),
      exchange.candles('ETHUSDT')
    ];
  });

  suite.testTradeStream(exchange => {
    exchange.addCandles(['BTC', 'USDT'], candleMock);
    exchange.setAssets(([
      { asset: 'USDT', available: 10000 },
      { asset: 'BTC', available: 1 }
    ]));
  });

  suite.testOrderStream(exchange => {
    exchange.addCandles(['BTC', 'USDT'], candleMock);
    exchange.setAssets(([
      { asset: 'USDT', available: 10000 },
      { asset: 'BTC', available: 1 }
    ]));
  });
});

describe('LocalExchange', () => {
  let strategy: TestStrategy<LocalExchange>;
  let localExchange: LocalExchange;
  let scheduler: TestScheduler;

  jest.useFakeTimers('modern');
  jest.setSystemTime(new Date('2021-12-01T11:40:00'));

  beforeEach(() => {
    localExchange = new LocalExchange();
    localExchange.addCandles(['BTC', 'USDT'], candleMock);
    localExchange.setAssets(([
      { asset: 'USDT', available: 10000 },
      { asset: 'BTC', available: 1 }
    ]));

    scheduler = new TestScheduler((received, expected) => {
      expect(received).toEqual(expected);
    });

    strategy = new TestStrategy(localExchange);
    strategy.setDebug(false);
  });

  afterEach(() => {
    strategy.onStop();
  });

  it('should sort reversed candles', () => {
    scheduler.run(({ expectObservable }) => {
      localExchange.addCandles(['BTC', 'USDT'], [candleMock[2], candleMock[1], candleMock[0]]);

      expectObservable(localExchange.candles('BTCUSDT')).toBe('(abc)', {
        a: expect.objectContaining({ start: new Date('2020-02-24T11:00:00') }),
        b: expect.objectContaining({ start: new Date('2020-02-24T12:00:00') }),
        c: expect.objectContaining({ start: new Date('2020-02-24T13:00:00') }),
      });
    });
  });

  it('should throw if candles could not be found', () => {
    expect(() => localExchange.candles('DOES_NOT_EXIST')).toThrowError('No candles added to local exchange for "DOES_NOT_EXIST"');
  });

  it('should be able to set assets', () => {
    const setInitialWalletSpy = jest.spyOn(localExchange.wallet, 'setInitialWallet');

    localExchange.setAssets([{ asset: 'BTC', available: 1 }]);
    expect(setInitialWalletSpy).toHaveBeenCalledWith([{ asset: 'BTC', available: 1 }]);
  });

  it('should create an open order', () => {
    scheduler.run(({ expectObservable }) => {
      const src$ = of(strategy.onStart()).pipe(
        switchMapTo(localExchange.openOrders$)
      );

      expectObservable(src$).toBe('(abcdefg)', {
        a: [],
        b: [
          <OpenOrder>{
            clientOrderId: expect.any(String),
            createTime: new Date('2020-02-24T12:00:00'),
            quantity: 1,
            side: OrderSide.BUY,
            status: OrderStatus.NEW,
            symbol: 'BTCUSDT',
            type: OrderType.MARKET
          }
        ],
        c: [],
        d: [
          <OpenOrder>{
            clientOrderId: expect.any(String),
            createTime: new Date('2020-02-24T13:00:00'),
            quantity: 1,
            side: OrderSide.SELL,
            status: OrderStatus.NEW,
            symbol: 'BTCUSDT',
            type: OrderType.MARKET
          }
        ],
        e: [
          <OpenOrder>{
            clientOrderId: expect.any(String),
            createTime: new Date('2020-02-24T14:00:00'),
            price: 9700,
            quantity: 1,
            side: OrderSide.BUY,
            status: OrderStatus.NEW,
            symbol: 'BTCUSDT',
            type: OrderType.LIMIT
          }
        ],
        f: [
          <OpenOrder>{
            clientOrderId: expect.any(String),
            createTime: new Date('2020-02-24T15:00:00'),
            price: 9800,
            quantity: 1,
            side: OrderSide.SELL,
            status: OrderStatus.NEW,
            symbol: 'BTCUSDT',
            type: OrderType.LIMIT
          }
        ],
        g: [],
      });
    });
  });

  it('should not create an open order if insufficient funds', () => {
    scheduler.run(({ expectObservable }) => {
      localExchange.setAssets(([
        { asset: 'USDT', available: 1 },
        { asset: 'BTC', available: 0.001 }
      ]));

      const src$ = of(strategy.onStart()).pipe(
        switchMapTo(localExchange.openOrders$)
      );

      expectObservable(src$).toBe('(a)', {
        a: expect.arrayContaining([]),
      });
    });
  });

  it('should throw if LIMIT buy is performed without price', async () => {
    await expect(localExchange.buy(<OrderCommand>{
      type: OrderType.LIMIT,
    })).rejects.toThrowError('Cannot create LIMIT order if no price is given');
  });

  it('should throw if no candles have been added for a certain pair', async () => {
    await expect(localExchange.buy(<OrderCommand>{
      symbol: 'SOLUSDT',
      type: OrderType.MARKET,
    })).rejects.toThrowError('No pair could be found for SOLUSDT');
  });

  it('should throw when trying to buy/sell without subscribing to that candle stream', async () => {
    await expect(localExchange.buy(<OrderCommand>{
      symbol: 'BTCUSDT',
      type: OrderType.MARKET,
    })).rejects.toThrowError('No active candle could be found for BTCUSDT');
  });

  it('should throw when trying to add an empty list of candles', async () => {
    expect(() => localExchange.addCandles(['BTC', 'USDT'], [])).toThrowError('Candle array should contain at least 1 candle');
  });
});
