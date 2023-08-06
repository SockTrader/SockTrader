import {
  BalanceUpdate,
  CandleChartInterval,
  ExecutionReport,
  ExecutionType,
  OrderStatus,
  OrderType,
  OutboundAccountPosition,
  UserDataStreamEvent,
} from 'binance-api-node';

export type CandleOptions = {
  symbol: string | string[];
  interval: CandleChartInterval;
};

export const isAssetUpdate = (msg: UserDataStreamEvent): msg is BalanceUpdate =>
  msg.eventType === <BalanceUpdate['eventType']>'balanceUpdate';

export const isExecutionReport = (
  msg: UserDataStreamEvent
): msg is ExecutionReport =>
  msg.eventType === <ExecutionReport['eventType']>'executionReport';

export const isWalletUpdate = (
  msg: UserDataStreamEvent
): msg is OutboundAccountPosition =>
  msg.eventType ===
  <OutboundAccountPosition['eventType']>'outboundAccountPosition';

export const isTrade = (msg: ExecutionReport): boolean =>
  msg.executionType === <ExecutionType.TRADE>'TRADE';

export const isOrder = (msg: ExecutionReport): boolean =>
  !isTrade(msg) || msg.orderStatus === <OrderStatus.FILLED>'FILLED';

export const isMarketOrder = (msg: ExecutionReport): boolean =>
  msg.orderType === <OrderType.MARKET>'MARKET';
