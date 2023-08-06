import {
  BalanceUpdate,
  Candle as BinanceCandle,
  CandleChartResult,
  ExecutionReport,
  NewOrderLimit,
  NewOrderMarketBase,
  NewOrderRespType_LT,
  Order as BinanceOrder,
  OrderType as BinanceOrderType,
  OutboundAccountPosition,
} from 'binance-api-node';
import {
  AssetDeltaUpdate,
  Candle,
  Order,
  OrderCommand,
  OrderSide,
  OrderStatus,
  OrderType,
  Trade,
  WalletUpdate,
} from '../../interfaces';
import { dollarCostAverage } from '../../utils';

export const mapCandle = (
  candle: CandleChartResult | BinanceCandle
): Candle => ({
  open: parseFloat(candle.open),
  high: parseFloat(candle.high),
  low: parseFloat(candle.low),
  close: parseFloat(candle.close),
  volume: parseFloat(candle.volume),
  start: new Date('startTime' in candle ? candle.startTime : candle.openTime),
});

export const mapExecutionReportToOrder = (report: ExecutionReport): Order => {
  if (report.eventType !== <ExecutionReport['eventType']>'executionReport')
    throw new Error(
      `Report has incorrect EventType. Expected 'executionReport', received: ${report.eventType}`
    );

  return {
    clientOrderId: report.newClientOrderId,
    originalClientOrderId:
      !report.originalClientOrderId || report.originalClientOrderId === ''
        ? undefined
        : report.originalClientOrderId,
    price: parseFloat(report.price),
    quantity: parseFloat(report.quantity),
    side: <OrderSide>report.side,
    status: <OrderStatus>report.orderStatus,
    symbol: report.symbol,
    type: <OrderType>report.orderType,
    createTime: new Date(report.creationTime),
  };
};

export const mapExecutionReportToTrade = (report: ExecutionReport): Trade => {
  if (report.eventType !== <ExecutionReport['eventType']>'executionReport')
    throw new Error(
      `Report has incorrect EventType. Expected 'executionReport', received: ${report.eventType}`
    );

  return {
    clientOrderId: report.newClientOrderId,
    originalClientOrderId:
      !report.originalClientOrderId || report.originalClientOrderId === ''
        ? undefined
        : report.originalClientOrderId,
    price: parseFloat(report.price),
    quantity: parseFloat(report.quantity),
    side: <OrderSide>report.side,
    status: <OrderStatus>report.orderStatus,
    symbol: report.symbol,
    tradeQuantity: parseFloat(report.lastTradeQuantity),
    commission: parseFloat(report.commission),
    commissionAsset: report.commissionAsset ?? undefined,
    createTime: new Date(report.orderTime),
  };
};

export const mapOrderCommand = (
  order: OrderCommand
): NewOrderMarketBase | NewOrderLimit => {
  if (!Object.values(OrderType).includes(order.type))
    throw new Error("Given 'type' in order is not supported.");

  const orderBase = {
    symbol: order.symbol,
    side: order.side,
    type: order.type as unknown as
      | NewOrderMarketBase['type']
      | NewOrderLimit['type'],
    quantity: order.quantity.toString(),
    newOrderRespType: <NewOrderRespType_LT>'FULL',
  };

  return !order.price
    ? <NewOrderMarketBase>orderBase
    : <NewOrderLimit>{
        ...orderBase,
        price: (<number>order.price)?.toString(),
      };
};

export const mapWalletUpdate = (
  accountPosition: OutboundAccountPosition
): WalletUpdate[] => {
  return accountPosition.balances.map((update) => ({
    reserved: parseFloat(update.locked),
    available: parseFloat(update.free),
    asset: update.asset,
  }));
};

export const mapAssetUpdate = (update: BalanceUpdate): AssetDeltaUpdate => {
  return {
    assetDelta: parseFloat(update.balanceDelta),
    asset: update.asset,
  };
};

export const mapOrderResponse = (
  order: BinanceOrder
): { order: Order; trades: Trade[] } | undefined => {
  if (order.type !== <BinanceOrderType.MARKET>'MARKET') return undefined;

  return {
    order: _mapBinanceOrderToOrder(order),
    trades: _mapBinanceOrderToTrades(order),
  };
};

const _mapBinanceOrderToOrder = (order: BinanceOrder): Order => {
  const basicOrderList = order.fills?.map((fill) => ({
    price: parseFloat(fill.price),
    quantity: parseFloat(fill.qty),
  }));

  return {
    clientOrderId: order.clientOrderId,
    originalClientOrderId: undefined,
    price: basicOrderList ? dollarCostAverage(basicOrderList) : 0,
    quantity: parseFloat(order.origQty),
    side: <OrderSide>order.side,
    status: <OrderStatus>order.status,
    symbol: order.symbol,
    type: <OrderType>order.type,
    createTime: new Date(order.time ?? order.transactTime),
  };
};

const _mapBinanceOrderToTrades = (order: BinanceOrder): Trade[] => {
  if (!order.fills) return [];

  return order.fills.map((fill) => ({
    clientOrderId: order.clientOrderId,
    originalClientOrderId: undefined,
    quantity: parseFloat(order.origQty),
    side: <OrderSide>order.side,
    status: <OrderStatus>order.status,
    symbol: order.symbol,
    createTime: new Date(order.time),
    price: parseFloat(fill.price),
    tradeQuantity: parseFloat(fill.qty),
    commission: parseFloat(fill.commission),
    commissionAsset: fill.commissionAsset,
  }));
};
