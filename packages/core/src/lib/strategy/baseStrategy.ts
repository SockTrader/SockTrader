import { Candle, CandleOptions, Exchange, Order, Strategy, Trade } from '@socktrader/core'
import { from, Observable } from 'rxjs';
import { EventType, PluginManager } from '../plugins/pluginManager'

export abstract class BaseStrategy implements Strategy {

  private readonly pluginManager = new PluginManager()

  plot(values: number[]): void
  plot(values: Observable<number>): void
  plot(values: number[] | Observable<number>): void {
    const values$ = Array.isArray(values) ? from(values) : values;
    this.pluginManager.observeEvent(EventType.INDICATOR, values$)
  }

  candlesFrom(exchange: Exchange, options: CandleOptions): Observable<Candle> {
    const candles$ = exchange.candles(options)

    this.pluginManager.observeEvent(EventType.CANDLE, candles$)

    return candles$
  }

  ordersFrom(exchange: Exchange): Observable<Order> {
    const orders$ = exchange.orders$

    this.pluginManager.observeEvent(EventType.ORDER, orders$)

    return orders$
  }

  tradesFrom(exchange: Exchange): Observable<Trade> {
    const trades$ = exchange.trades$

    this.pluginManager.observeEvent(EventType.TRADE, trades$)

    return trades$
  }

  onStop(): void {
    this.pluginManager.unregisterAll()
  }

  onStart(): void {
  }

}
