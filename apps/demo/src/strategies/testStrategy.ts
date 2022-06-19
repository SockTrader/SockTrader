import { BaseStrategy, Candle, LocalExchange, OrderType, Strategy } from '@socktrader/core'
import parse from 'date-fns/parse'
import * as data from '../../../../data/coinbase_btcusd_1h.json'

interface CoinbaseCandle {
  Date: string;
  Symbol: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  'Volume BTC': number;
  'Volume USD': number;
}

export class TestStrategy extends BaseStrategy implements Strategy {

  bought = false

  sold = false

  exchange : LocalExchange

  constructor() {
    super()

    const exchange = new LocalExchange()

    //@ts-ignore
    exchange.addCandles(['BTC', 'USDT'], data.candles.map((c: CoinbaseCandle) => this.mapCoinbaseCandle(c)))
    exchange.setAssets([{
      asset: 'USDT',
      quantity: 10000
    }])

    this.exchange = exchange
  }

  onStart(): void {
    this.candlesFrom(this.exchange, { symbol: ['BTC', 'USDT'] })
      .subscribe(candle => this.updateCandle(candle))

    this.ordersFrom(this.exchange)
      .subscribe(console.log)
  }

  mapCoinbaseCandle(candle: CoinbaseCandle) {
    return {
      open: candle.Open,
      high: candle.High,
      low: candle.Low,
      close: candle.Close,
      volume: candle['Volume BTC'],
      start: parse(candle.Date, 'yyyy-MM-dd hh-a', new Date()),
    }
  }

  private async updateCandle(candle: Candle) {
    if (candle.close > 7000 && !this.bought) {
      await this.exchange.buy({ symbol: 'BTCUSDT', type: OrderType.MARKET, quantity: 1 })
      this.bought = true
    }

    if (candle.close > 10000 && !this.sold) {
      await this.exchange.sell({ symbol: 'BTCUSDT', type: OrderType.MARKET, quantity: 1 })
      this.sold = true
    }
  }

}
