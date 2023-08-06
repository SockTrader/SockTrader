import {
  Binance,
  Candle,
  Order,
  OrderSide,
  OrderStatus,
  OrderType,
  Strategy,
} from '@socktrader/core';
import { CandleChartInterval } from 'binance-api-node';
import { CrossDown, CrossUp, SMA } from 'technicalindicators';

export class MovingAverageStrategy implements Strategy {
  private readonly _binance: Binance;

  private canBuy = true;

  private canSell = false;

  private fastSMA: SMA;

  private slowSMA: SMA;

  private crossUp: CrossUp;

  private crossDown: CrossDown;

  constructor() {
    this.fastSMA = new SMA({ period: 12, values: [] });
    this.slowSMA = new SMA({ period: 24, values: [] });
    this.crossUp = new CrossUp({ lineA: [], lineB: [] });
    this.crossDown = new CrossDown({ lineA: [], lineB: [] });

    this._binance = new Binance();
  }

  onStart(): void {
    this._binance
      .candles({ symbol: 'BTCUSDT', interval: CandleChartInterval.ONE_HOUR })
      .subscribe((candle) => this.updateCandle(candle));

    this._binance.orders$.subscribe((order) => this.updateOrder(order));
  }

  updateOrder(order: Order): void {
    if (order.status === OrderStatus.FILLED) {
      this.canBuy = order.side === OrderSide.SELL;
      this.canSell = order.side === OrderSide.BUY;
    }
  }

  updateCandle(candle: Candle): void {
    const fastSMA = this.fastSMA.nextValue(candle.close);
    const slowSMA = this.slowSMA.nextValue(candle.close);

    const up =
      fastSMA != null ? this.crossUp.nextValue(fastSMA, slowSMA ?? 0) : false;
    const down =
      fastSMA != null ? this.crossDown.nextValue(fastSMA, slowSMA ?? 0) : false;

    if (up && this.canBuy) {
      this.canBuy = false;
      return this.buy(1, candle.close);
    }

    if (down && this.canSell) {
      this.canSell = false;
      return this.sell(1, candle.close);
    }
  }

  buy(quantity: number, price: number): void {
    this._binance.buy({
      symbol: 'BTCUSDT',
      price: price,
      type: OrderType.LIMIT,
      quantity: quantity,
    });
  }

  sell(quantity: number, price: number): void {
    this._binance.sell({
      symbol: 'BTCUSDT',
      price: price,
      type: OrderType.LIMIT,
      quantity: quantity,
    });
  }
}
