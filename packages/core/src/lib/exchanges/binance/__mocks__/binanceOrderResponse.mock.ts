import { Order, TimeInForce } from 'binance-api-node';
import {
  OrderSide,
  OrderStatus,
  OrderType,
} from '../../../interfaces/order.interfaces';

export const binanceOrderMock: Order = {
  symbol: 'BTCUSDT',
  orderId: 28,
  orderListId: -1, //Unless OCO, value will be -1
  clientOrderId: '6gCrw2kRUAF9CvJDGP16IP',
  transactTime: 1507725176595,
  price: '0.00000000',
  origQty: '10.00000000',
  executedQty: '10.00000000',
  cummulativeQuoteQty: '10.00000000',
  isWorking: true,
  updateTime: 1507725176595,
  time: 1507725176595,
  status: <OrderStatus>'FILLED',
  timeInForce: <TimeInForce>'GTC',
  type: <OrderType>'MARKET',
  side: <OrderSide>'SELL',
  fills: [
    {
      tradeId: 1,
      price: '4000.00000000',
      qty: '1.00000000',
      commission: '4.00000000',
      commissionAsset: 'USDT',
    },
    {
      tradeId: 2,
      price: '3999.00000000',
      qty: '5.00000000',
      commission: '19.99500000',
      commissionAsset: 'USDT',
    },
    {
      tradeId: 3,
      price: '3998.00000000',
      qty: '2.00000000',
      commission: '7.99600000',
      commissionAsset: 'USDT',
    },
    {
      tradeId: 4,
      price: '3997.00000000',
      qty: '1.00000000',
      commission: '3.99700000',
      commissionAsset: 'USDT',
    },
    {
      tradeId: 5,
      price: '3995.00000000',
      qty: '1.00000000',
      commission: '3.99500000',
      commissionAsset: 'USDT',
    },
  ],
};
