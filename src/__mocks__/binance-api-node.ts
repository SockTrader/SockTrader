import { Candle, CandleChartInterval, ExchangeInfo, NewOrderSpot, Order, UserDataStreamEvent, OrderType } from 'binance-api-node';
import { OrderStatus } from '../core/order.interfaces';
import { binanceExchangeInfoMock, binanceOrderMock } from './binance.mock';

let candleMap = new Map<string, Candle[]>();
let userDataStream: undefined | ((cb: UserDataStreamEvent) => void) = undefined;

//noinspection JSUnusedGlobalSymbols
export const __setCandles = (symbol: string, interval: CandleChartInterval, mockedCandles: Candle[]) => {
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

export default () => {
  return {
    ws: {
      candles: (symbol: string | string[], interval: string, cb: (candle: Candle) => void) => {
        candleMap.get(`${symbol}-${interval}`)?.forEach(candle => cb(candle));
      },
      user: (cb: (msg: UserDataStreamEvent) => void) => {
        userDataStream = cb;
      }
    },
    exchangeInfo: async (): Promise<ExchangeInfo> => {
      return binanceExchangeInfoMock;
    },
    order: async (options: NewOrderSpot): Promise<Order> => {
      if (options.type === OrderType.LIMIT) {
        return {
          ...binanceOrderMock,
          type: OrderType.LIMIT,
          status: OrderStatus.NEW,
          side: options.side,
          price: options.price,
          executedQty: options.quantity,
          origQty: options.quantity,
        };
      }

      return binanceOrderMock;
    },
  }

}
