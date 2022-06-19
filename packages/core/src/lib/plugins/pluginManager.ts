import { Observable } from 'rxjs'
import LogPlugin from './logPlugin/log.plugin'
import PersistPlugin from './persistPlugin/persist.plugin'
import { isCandlePlugin, isIndicatorPlugin, isOrderPlugin, isTradePlugin, Plugin } from './plugin.interfaces'
import WebPlugin from './webPlugin/web.plugin'

export enum EventType {
  CANDLE = 'candle',
  ORDER = 'order',
  TRADE = 'trade',
  INDICATOR = 'indicator',
}

export class PluginManager {

  private plugins: Plugin[] = []

  constructor() {
    // @todo use config and/or automatically resolve plugin as a dependency
    this.plugins.push(new LogPlugin())
    this.plugins.push(new PersistPlugin())
    this.plugins.push(new WebPlugin())
  }

  unregisterAll() {
    this.plugins.forEach(plugin => plugin.onUnregister())
  }

  observeEvent(eventType: EventType, event: Observable<any>) {
    switch (eventType) {
      case EventType.CANDLE:
        this.plugins.forEach(p => {
          if (isCandlePlugin(p)) {
            p.addCandles$(event)
          }
        })
        break;
      case EventType.ORDER:
        this.plugins.forEach(p => {
          if (isOrderPlugin(p)) {
            p.addOrders$(event)
          }
        })
        break;
      case EventType.TRADE:
        this.plugins.forEach(p => {
          if (isTradePlugin(p)) {
            p.addTrades$(event)
          }
        })
        break;
      case EventType.INDICATOR:
        this.plugins.forEach(p => {
          if (isIndicatorPlugin(p)) {
            p.addIndicator$(event)
          }
        })
        break;
    }
  }

}
