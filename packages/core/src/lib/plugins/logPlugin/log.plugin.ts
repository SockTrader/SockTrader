import { Candle, Order, Trade } from '@socktrader/core'
import { Observable } from 'rxjs'
import { BasePlugin } from '../basePlugin'
import { CandlePlugin, OrderPlugin, TradePlugin } from '../plugin.interfaces'

export default class LogPlugin extends BasePlugin implements CandlePlugin, TradePlugin, OrderPlugin {

  handle<T>(obs$: Observable<T>): void {
    this.subscribe(obs$, console.log)
  }

  addCandles$(candle$: Observable<Candle>): void {
    this.handle(candle$)
  }

  addOrders$(order$: Observable<Order>): void {
    this.handle(order$)
  }

  addTrades$(trade$: Observable<Trade>): void {
    this.handle(trade$)
  }

}
