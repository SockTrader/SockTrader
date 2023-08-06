import { TestScheduler } from 'rxjs/testing';
import { localExchangeCandlesMock as candleMock } from '../../__mocks__/localExchange.mock';
import { TestStrategy } from '../../__mocks__/testStrategy.mock';
import { OrderCommand, OrderType } from '../../interfaces';
import { LocalExchange } from './localExchange';

describe('LocalExchange', () => {
  let strategy: TestStrategy<LocalExchange>;
  let localExchange: LocalExchange;
  let scheduler: TestScheduler;

  jest.useFakeTimers();
  jest.setSystemTime(new Date('2021-12-01T11:40:00'));

  beforeEach(() => {
    localExchange = new LocalExchange();
    localExchange.addCandles(['BTC', 'USDT'], candleMock);
    localExchange.setAssets([
      { asset: 'USDT', quantity: 10000 },
      { asset: 'BTC', quantity: 1 },
    ]);

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
      localExchange.addCandles(
        ['ETH', 'USDT'],
        [candleMock[2], candleMock[1], candleMock[0]]
      );

      expectObservable(localExchange.candles('ETHUSDT')).toBe('(abc)', {
        a: expect.objectContaining({ start: new Date('2020-02-24T11:00:00') }),
        b: expect.objectContaining({ start: new Date('2020-02-24T12:00:00') }),
        c: expect.objectContaining({ start: new Date('2020-02-24T13:00:00') }),
      });
    });
  });

  it('should throw if candles could not be found', () => {
    expect(() => localExchange.candles('DOES_NOT_EXIST')).toThrowError(
      'No candles added to local exchange for "DOES_NOT_EXIST"'
    );
  });

  it('should throw if candles already have been added', () => {
    expect(() =>
      localExchange.addCandles(['BTC', 'USDT'], candleMock)
    ).toThrowError('A set of candles has already been added for BTCUSDT');
  });

  it('should be able to set assets', () => {
    const setInitialWalletSpy = jest.spyOn(
      localExchange.wallet,
      'setInitialWallet'
    );

    localExchange.setAssets([{ asset: 'BTC', quantity: 1 }]);
    expect(setInitialWalletSpy).toHaveBeenCalledWith([
      { asset: 'BTC', quantity: 1 },
    ]);
  });

  it('should throw if LIMIT buy is performed without price', async () => {
    await expect(
      localExchange.buy(<OrderCommand>{
        type: OrderType.LIMIT,
      })
    ).rejects.toThrowError('Cannot create LIMIT order if no price is given');
  });

  it('should throw if no candles have been added for a certain pair', async () => {
    await expect(
      localExchange.buy(<OrderCommand>{
        symbol: 'SOLUSDT',
        type: OrderType.MARKET,
      })
    ).rejects.toThrowError('No pair could be found for SOLUSDT');
  });

  it('should throw when trying to buy/sell without subscribing to that candle stream', async () => {
    await expect(
      localExchange.buy(<OrderCommand>{
        symbol: 'BTCUSDT',
        type: OrderType.MARKET,
      })
    ).rejects.toThrowError('No active candle could be found for BTCUSDT');
  });

  it('should throw when trying to add an empty list of candles', async () => {
    expect(() => localExchange.addCandles(['BTC', 'USDT'], [])).toThrowError(
      'Candle array should contain at least 1 candle'
    );
  });

  // @TODO test it should not be possible to fill an open order with a candle from a different pair
  // Ex: "BUY 1 BTC" getting filled with ETHUSDT candles
});
