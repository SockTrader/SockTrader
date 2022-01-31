import { Subscription } from 'rxjs';
import { Candle } from '../src/core/candle.interfaces';
import { Exchange } from '../src/core/exchange.interfaces';
import { Order, OrderType } from '../src/core/order.interfaces';
import { Strategy } from '../src/core/strategy.interfaces';
import { Trade } from '../src/core/trade.interfaces';

export default class TestStrategy<T extends Exchange> implements Strategy {

  public onError = console.log;

  private readonly _exchange: T;

  private _candleSub: Subscription | undefined;

  private _orderSub: Subscription | undefined;

  private _tradeSub: Subscription | undefined;

  private candleNr = 0;

  constructor(exchange: T) {
    this._exchange = exchange;
  }

  onStart(): void {
    this._candleSub = this._exchange
      .candles('BTCUSDT')
      .subscribe(candle => this.updateCandle(candle));

    this._orderSub = this._exchange.orders$
      .subscribe(order => this.updateOrder(order));

    this._tradeSub = this._exchange.trades$
      .subscribe(trade => this.updateTrades(trade));
  }

  onStop(): void {
    if (this._candleSub) this._candleSub.unsubscribe();
    if (this._orderSub) this._orderSub.unsubscribe();
    if (this._tradeSub) this._tradeSub.unsubscribe();
  }

  //noinspection JSUnusedLocalSymbols
  async updateCandle(candle: Candle): Promise<void> {
    this.candleNr += 1;

    if (this.candleNr === 2) { // '2020-02-24T12:00:00'
      await this._exchange.buy({
        symbol: 'BTCUSDT',
        type: OrderType.MARKET,
        quantity: 1
      }).catch(this.onError);
    }

    if (this.candleNr === 3) { // '2020-02-24T13:00:00'
      await this._exchange.sell({
        symbol: 'BTCUSDT',
        type: OrderType.MARKET,
        quantity: 1
      }).catch(this.onError);
    }

    if (this.candleNr === 4) { // '2020-02-24T14:00:00'
      await this._exchange.buy({
        symbol: 'BTCUSDT',
        type: OrderType.LIMIT,
        price: 9700,
        quantity: 1
      }).catch(this.onError);
    }

    if (this.candleNr === 5) { // '2020-02-24T15:00:00'
      await this._exchange.sell({
        symbol: 'BTCUSDT',
        type: OrderType.LIMIT,
        price: 9800,
        quantity: 1
      }).catch(this.onError);
    }
  }

  //noinspection JSUnusedLocalSymbols
  updateOrder(order: Order): void {
  }

  //noinspection JSUnusedLocalSymbols
  updateTrades(trade: Trade): void {
  }

  setDebug(debug = true) {
    debug
      ? this.onError = console.log
      : this.onError = () => {};
  }
}
