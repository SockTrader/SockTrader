import { Candle, Order, Trade } from '@socktrader/core'
import { Observable } from 'rxjs';

export interface Plugin {
  onRegister(): void;

  onUnregister(): void;
}

export interface CandlePlugin extends Plugin {
  addCandles$(candle$: Observable<Candle>): void;
}

export const isCandlePlugin = (plugin: Plugin): plugin is CandlePlugin => {
  return (plugin as CandlePlugin).addCandles$ !== undefined
}

export interface TradePlugin extends Plugin {
  addTrades$(trade$: Observable<Trade>): void;
}

export const isTradePlugin = (plugin: Plugin): plugin is TradePlugin => {
  return (plugin as TradePlugin).addTrades$ !== undefined
}

export interface OrderPlugin extends Plugin {
  addOrders$(order$: Observable<Order>): void;
}

export const isOrderPlugin = (plugin: Plugin): plugin is OrderPlugin => {
  return (plugin as OrderPlugin).addOrders$ !== undefined
}

export interface IndicatorPlugin extends Plugin {
  addIndicator$(indicator$: Observable<number>): void;
}

export const isIndicatorPlugin = (plugin: Plugin): plugin is IndicatorPlugin => {
  return (plugin as IndicatorPlugin).addIndicator$ !== undefined
}
