import config from 'config';
import { nanoid } from 'nanoid';
import {
  Candle,
  Order,
  OrderCommand,
  OrderSide,
  OrderStatus,
  OrderType,
  Pair,
  Trade,
} from '../../interfaces';
import { OpenOrder } from './localExchange.interfaces';

export const mapOrderCommandToOpenOrder = (
  orderCommand: OrderCommand,
  candle: Candle
): OpenOrder => {
  return {
    clientOrderId: orderCommand.clientOrderId ?? nanoid(),
    price:
      orderCommand.type === OrderType.LIMIT ? orderCommand.price : undefined,
    quantity: orderCommand.quantity,
    side: orderCommand.side,
    status: OrderStatus.NEW,
    symbol: orderCommand.symbol,
    type: orderCommand.type,
    createTime: candle.start,
  };
};

export const mapOpenOrderToOrder = (
  order: OpenOrder,
  candle: Candle,
  pair: Pair,
  orderPrice: number
): Omit<Order, 'status'> => {
  return {
    clientOrderId: order.clientOrderId,
    originalClientOrderId: order.originalClientOrderId,
    price: orderPrice,
    quantity: order.quantity,
    side: order.side,
    symbol: order.symbol,
    type: order.type,
    createTime: order.createTime,
  };
};

export const mapOpenOrderToTrade = (
  order: OpenOrder,
  candle: Candle,
  pair: Pair,
  orderPrice: number
): Trade => {
  const fee: number =
    order.type === OrderType.MARKET
      ? config.get('exchanges.local.feeTaker')
      : config.get('exchanges.local.feeMaker');

  const commission =
    order.side === OrderSide.BUY
      ? order.quantity * fee
      : order.quantity * (fee * orderPrice);

  return {
    clientOrderId: order.clientOrderId,
    originalClientOrderId: order.originalClientOrderId,
    price: orderPrice,
    quantity: order.quantity,
    side: order.side,
    status: OrderStatus.FILLED,
    symbol: order.symbol,
    tradeQuantity: order.quantity,
    commission: commission,
    commissionAsset: order.side === OrderSide.BUY ? pair[0] : pair[1],
    // @todo:
    // It would be better to increment createTime with 1 interval or wait for the next candle to use `candle.start`.
    // or else the trade would be created in the ‘past'
    createTime: candle.start,
  };
};
