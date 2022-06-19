import { BaseStrategy, Candle, LocalExchange, Order, OrderSide, OrderStatus, OrderType, Strategy } from '@socktrader/core'
import parse from 'date-fns/parse'
import { CrossDown, CrossUp, SMA } from 'technicalindicators'
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

export class LocalMovingAverageStrategy extends BaseStrategy implements Strategy {

  private canBuy = true

  private canSell = false

  private fastSMA: SMA

  private slowSMA: SMA

  private crossUp: CrossUp

  private crossDown: CrossDown

  private exchange: LocalExchange

  constructor() {
    super()

    this.fastSMA = new SMA({ period: 12, values: [] })
    this.slowSMA = new SMA({ period: 24, values: [] })
    this.crossUp = new CrossUp({ lineA: [], lineB: [] })
    this.crossDown = new CrossDown({ lineA: [], lineB: [] })

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
      .subscribe(order => this.updateOrder(order))
  }

  updateOrder(order: Order): void {
    if (order.status === OrderStatus.FILLED) {
      this.canBuy = order.side === OrderSide.SELL
      this.canSell = order.side === OrderSide.BUY
    }
  }

  updateCandle(candle: Candle): void {
    const fastSMA = this.fastSMA.nextValue(candle.close)
    const slowSMA = this.slowSMA.nextValue(candle.close)

    const up = fastSMA != null ? this.crossUp.nextValue(fastSMA, slowSMA ?? 0) : false
    const down = fastSMA != null ? this.crossDown.nextValue(fastSMA, slowSMA ?? 0) : false

    if (up && this.canBuy) {
      this.canBuy = false
      return this.buy(0.1, candle.close)
    }

    if (down && this.canSell) {
      this.canSell = false
      return this.sell(0.1, candle.close)
    }
  }

  buy(quantity: number, price: number): void {
    this.exchange.buy({
      symbol: 'BTCUSDT',
      price: price,
      type: OrderType.LIMIT,
      quantity: quantity
    })
  }

  sell(quantity: number, price: number): void {
    this.exchange.sell({
      symbol: 'BTCUSDT',
      price: price,
      type: OrderType.LIMIT,
      quantity: quantity
    })
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

}
