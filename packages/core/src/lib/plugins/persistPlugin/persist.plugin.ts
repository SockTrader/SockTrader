import { Candle, config, insertOrder, insertTrade, Order, Trade } from '@socktrader/core'
import { Observable } from 'rxjs'
import { BasePlugin } from '../basePlugin'
import { CandlePlugin, OrderPlugin, TradePlugin } from '../plugin.interfaces'

export default class PersistPlugin extends BasePlugin implements TradePlugin, OrderPlugin {

  addOrders$(order$: Observable<Order>): void {
    if (config.get('plugin:persist:orders')) {
      this.subscribe(order$, async (order) => {
        await insertOrder(order)
      })
    }
  }

  addTrades$(trade$: Observable<Trade>): void {
    if (config.get('plugin:persist:trades')) {
      this.subscribe(trade$, async (trade) => {
        await insertTrade(trade)
      })
    }
  }

}
