import { Candle, Order, Trade } from '@socktrader/core'
import { Observable } from 'rxjs'
import { parentPort } from 'worker_threads'
import { BasePlugin } from '../basePlugin'
import { CandlePlugin, IndicatorPlugin, OrderPlugin, TradePlugin } from '../plugin.interfaces'

export default class WebPlugin extends BasePlugin implements TradePlugin, OrderPlugin, CandlePlugin, IndicatorPlugin {

  addOrders$(order$: Observable<Order>): void {
    this.subscribe(order$, async (order) => {
      parentPort?.postMessage(order)
    })
  }

  addTrades$(trade$: Observable<Trade>): void {
    this.subscribe(trade$, async (trade) => {
      parentPort?.postMessage(trade)
    })
  }

  addCandles$(candle$: Observable<Candle>): void {
    this.subscribe(candle$, async (candle) => {
      parentPort?.postMessage(candle)
    })
  }

  addIndicator$(indicator$: Observable<number>): void {
    this.subscribe(indicator$, async (indicator) => {
      parentPort?.postMessage(indicator)
    })
  }

}
