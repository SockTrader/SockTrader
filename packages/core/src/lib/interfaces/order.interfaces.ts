import { CandleChartInterval } from 'binance-api-node';

export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
}

export enum OrderStatus {
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  FILLED = 'FILLED',
  NEW = 'NEW',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  PENDING_CANCEL = 'PENDING_CANCEL',
  REJECTED = 'REJECTED',
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface OrderCommand {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  clientOrderId?: string;
}

export interface Order {
  clientOrderId: string;
  originalClientOrderId?: string;
  price: number;
  quantity: number;
  side: OrderSide;
  status: OrderStatus;
  symbol: string;
  type: OrderType;
  createTime: Date;
}

export interface CandlesOptions {
  symbol: string;
  interval: CandleChartInterval;
  limit?: number;
  startTime?: number;
  endTime?: number;
}
