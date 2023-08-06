import {
  Candle,
  CandleChartInterval,
  ExchangeInfo,
  NewOrderSpot,
  Order,
  UserDataStreamEvent,
} from 'binance-api-node';
import { binanceExchangeInfoMock } from '../exchanges/binance/__mocks__/binanceExchangeInfo.mock';

const candleMap = new Map<string, Candle[]>();
let userDataStream: undefined | ((cb: UserDataStreamEvent) => void) = undefined;

//noinspection JSUnusedGlobalSymbols
export const __setCandles = (
  symbol: string,
  interval: CandleChartInterval,
  mockedCandles: Candle[]
) => {
  candleMap.set(`${symbol}-${interval}`, mockedCandles);
};

//noinspection JSUnusedGlobalSymbols
export const __emitUserDataStreamEvents = (event: UserDataStreamEvent) => {
  if (userDataStream) {
    userDataStream(event);
  } else {
    throw new Error('UserDataStream is undefined');
  }
};

//eslint-disable-next-line @typescript-eslint/no-unused-vars
export const __orderResponse = jest.fn((options: NewOrderSpot): Order => {
  return {} as Order;
});

export default () => {
  return {
    ws: {
      candles: (
        symbol: string | string[],
        interval: string,
        cb: (candle: Candle) => void
      ) => {
        candleMap.get(`${symbol}-${interval}`)?.forEach((candle) => cb(candle));
      },
      user: (cb: (msg: UserDataStreamEvent) => void) => {
        userDataStream = cb;
      },
    },
    exchangeInfo: jest.fn(
      async (): Promise<ExchangeInfo> => binanceExchangeInfoMock
    ),
    order: __orderResponse,
  };
};
