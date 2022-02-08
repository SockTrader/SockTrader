import { Subscription } from 'rxjs';
import { Candle } from '../core/candle.interfaces';
import { Exchange } from '../core/exchange.interfaces';
import { OrderType } from '../core/order.interfaces';
import { Strategy } from '../core/strategy.interfaces';

export default class TestStrategy<T extends Exchange> implements Strategy {

  public noop = () => null;

  public onError = console.log;

  readonly _exchange: T;

  private _candleSub: Subscription | undefined;

  private _orderSub: Subscription | undefined;

  private _tradeSub: Subscription | undefined;

  private candleNr = 0;

  constructor(exchange: T) {
    this._exchange = exchange;
  }

  //@ts-ignore
  onStart(candleOptions: unknown): void {
    this._candleSub = this._exchange
      .candles(candleOptions)
      .subscribe(candle => this.updateCandle(candle));

    this._orderSub = this._exchange.orders$.subscribe(this.noop);
    this._tradeSub = this._exchange.trades$.subscribe(this.noop);
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

  setDebug(debug = true) {
    debug
      ? this.onError = console.log
      : this.onError = () => null;
  }
}
