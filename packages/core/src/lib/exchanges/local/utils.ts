import config from 'config';
import {
  Candle,
  Pair,
  Trade,
  Order,
  OrderSide,
  OrderType,
} from '../../interfaces';
import { OpenOrder } from './localExchange.interfaces';
import { mapOpenOrderToOrder, mapOpenOrderToTrade } from './mapper';

/**
 * LIMIT order : returns the order price
 * MARKET order : calculates the order price based on current candle and configured slippage
 * @param {Candle} candle
 * @param {OpenOrder} order
 * @returns {boolean}
 */
export const calculateOrderPrice = (
  order: OpenOrder,
  candle: Candle
): number => {
  if (order.type !== OrderType.MARKET) return <number>order.price;

  const slippage = parseFloat(config.get('exchanges.local.slippage'));
  const applied = order.side === OrderSide.BUY ? +slippage : -slippage;

  return candle.close * (1 + applied);
};

/**
 * Determines if the order can be filled within the given candle
 * @param {Candle} candle
 * @param {OpenOrder} order
 * @returns {boolean}
 */
export const canBeFilled = (candle: Candle, order: OpenOrder): boolean => {
  if (order.type === OrderType.MARKET) return true; // market order

  //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    (order.side === OrderSide.BUY && candle.low <= order.price!) ||
    (order.side === OrderSide.SELL && candle.high >= order.price!)
  );
};

/**
 * Returns a Trade object if the given order can be filled in the given candle.
 * @param {Order} order
 * @param {Candle} candle
 * @param pair
 * @param orderPrice
 * @returns {Trade | undefined}
 */
export const createTradeFromOpenOrder = (
  order: OpenOrder,
  candle: Candle,
  pair: Pair,
  orderPrice: number
): Trade | void => {
  if (canBeFilled(candle, order)) {
    return mapOpenOrderToTrade(order, candle, pair, orderPrice);
  }
};

/**
 * Returns an Order object if the given order can be filled in the given candle.
 * @param {Order} order
 * @param {Candle} candle
 * @param pair
 * @param orderPrice
 * @returns {Trade | undefined}
 */
export const createOrderFromOpenOrder = (
  order: OpenOrder,
  candle: Candle,
  pair: Pair,
  orderPrice: number
): Omit<Order, 'status'> | void => {
  if (canBeFilled(candle, order)) {
    return mapOpenOrderToOrder(order, candle, pair, orderPrice);
  }
};
