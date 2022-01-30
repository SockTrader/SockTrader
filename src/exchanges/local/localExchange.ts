import config from 'config';
import { nanoid } from 'nanoid';
import { asyncScheduler, BehaviorSubject, combineLatest, distinctUntilChanged, from, map, Observable, scheduled, Subject, tap } from 'rxjs';
import { Candle } from '../../core/candle.interfaces';
import { Exchange } from '../../core/exchange.interfaces';
import { Order, OrderCommand, OrderSide, OrderStatus, OrderType } from '../../core/order.interfaces';
import { Pair } from '../../core/pair.interfaces';
import { Trade } from '../../core/trade.interfaces';
import { Asset } from '../../core/wallet.interfaces';
import WalletService from '../../core/wallet/wallet.service';
import { OpenOrder } from './localExchange.interfaces';

export default class LocalExchange implements Exchange {

  readonly trades$: Subject<Trade> = new Subject<Trade>();

  readonly orders$: Subject<Order> = new Subject<Order>();

  readonly wallet: WalletService = new WalletService();

  _candleCollections: Map<string, Candle[]> = new Map<string, Candle[]>();

  _symbolWithPair: Map<string, Pair> = new Map<string, Pair>();

  _symbolWithCandle: Map<string, Candle> = new Map<string, Candle>();

  private readonly _openOrders$: BehaviorSubject<OpenOrder[]> = new BehaviorSubject<OpenOrder[]>([]);

  readonly openOrders$: Observable<OpenOrder[]> = this._openOrders$.pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
  );

  constructor() {
    this.trades$.subscribe((trade: Trade) => {
      const pair: Pair = this.getPair(trade.symbol);
      this.wallet.updateSpotByTrade(trade, pair);
    });
  }

  candles(symbol: string): Observable<Candle> {
    const candles = this._candleCollections.get(symbol);

    if (candles == null) {
      throw new Error(`No candles added to local exchange for "${symbol}"`);
    }

    return combineLatest([
      scheduled(from(candles), asyncScheduler),
      this._openOrders$
    ]).pipe(
      tap(([candle, openOrders]) => this.fillOpenOrders(openOrders, candle)),
      tap(([candle]) => this._symbolWithCandle.set(symbol, candle)),
      map(([candle]) => candle),
      // The distinctUntilChanged would prevent similar candles from leaking into the stream. Since OpenOrders$ could emit multiple times
      distinctUntilChanged((prev, curr) => prev.start.getTime() === curr.start.getTime())
    );
  }

  async buy(orderCommand: Omit<OrderCommand, 'side'>): Promise<void> {
    this.createOpenOrder({
      ...orderCommand,
      side: OrderSide.BUY
    });

    return Promise.resolve();
  }

  async buyMargin(): Promise<never> {
    throw new Error('margin trading is not supported yet');
  }

  async sell(orderCommand: Omit<OrderCommand, 'side'>): Promise<void> {
    this.createOpenOrder({
      ...orderCommand,
      side: OrderSide.SELL
    });
  }

  async sellMargin(): Promise<never> {
    throw new Error('margin trading is not supported yet');
  }

  addCandles(pair: Pair, candles: Candle[]): void {
    if (candles.length <= 0) {
      throw new Error('Candle array should contain at least 1 candle');
    }

    const first = candles[0]?.start?.getTime();
    const last = candles[candles.length - 1].start.getTime();

    const symbol: string = pair[0] + pair[1];
    this._symbolWithPair.set(symbol, pair);

    this._candleCollections.set(symbol, first > last ? candles.reverse() : candles);
  }

  setAssets(initialWallet: Asset[]): void {
    this.wallet.setInitialWallet(initialWallet);
  }

  private getPair(symbol: string): Pair {
    const pair = this._symbolWithPair.get(symbol);

    if (pair == null) {
      throw new Error(`No pair could be found for ${symbol}`);
    }

    return pair;
  }

  private getCandle(symbol: string): Candle {
    const candle = this._symbolWithCandle.get(symbol);

    if (candle == null) {
      throw new Error(`No active candle could be found for ${symbol}`);
    }

    return candle;
  }

  /**
   * Determines if the order can be filled within the given candle
   * @param {Candle} candle
   * @param {OpenOrder} order
   * @returns {boolean}
   * @private
   */
  private canBeFilled(candle: Candle, order: OpenOrder): boolean {
    if (order.type === OrderType.MARKET) return true; // market order

    //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return ((order.side === OrderSide.BUY && candle.low <= order.price!) || (order.side === OrderSide.SELL && candle.high >= order.price!));
  }

  /**
   * Returns a Trade object if the given order can be filled in the given candle.
   * @param {Order} order
   * @param {Candle} candle
   * @returns {Trade | undefined}
   * @private
   */
  private createTradeFromOpenOrder(order: OpenOrder, candle: Candle): Trade | void {
    if (this.canBeFilled(candle, order)) {
      return this.mapOpenOrderToTrade(order, candle);
    }
  }

  /**
   * Returns an Order object if the given order can be filled in the given candle.
   * @param {Order} order
   * @param {Candle} candle
   * @returns {Trade | undefined}
   * @private
   */
  private createOrderFromOpenOrder(order: OpenOrder, candle: Candle): Order | void {
    if (this.canBeFilled(candle, order)) {
      return this.mapOpenOrderToOrder(order, candle);
    }
  }

  private getOrderPrice(order: OpenOrder, candle: Candle): number {
    if (order.type !== OrderType.MARKET) return <number>order.price;

    const slippage = parseFloat(config.get('exchanges.local.slippage'));
    const applied = (order.side === OrderSide.BUY) ? +slippage : -slippage;

    return candle.close * (1 + applied);
  }

  private mapOpenOrderToOrder(order: OpenOrder, candle: Candle): Order {
    return ({
      clientOrderId: order.clientOrderId,
      originalClientOrderId: order.originalClientOrderId,
      price: this.getOrderPrice(order, candle),
      quantity: order.quantity,
      side: order.side,
      status: OrderStatus.FILLED,
      symbol: order.symbol,
      type: order.type,
      createTime: order.createTime
    });
  }

  private mapOpenOrderToTrade(order: OpenOrder, candle: Candle): Trade {
    const pair: Pair = this.getPair(order.symbol);
    const fee: number = order.type === OrderType.MARKET
      ? config.get('exchanges.local.feeTaker')
      : config.get('exchanges.local.feeMaker');

    const price = this.getOrderPrice(order, candle);
    const commission = order.side === OrderSide.BUY
      ? order.quantity * fee
      : order.quantity * (fee * price);

    return ({
      clientOrderId: order.clientOrderId,
      originalClientOrderId: order.originalClientOrderId,
      price: price,
      quantity: order.quantity,
      side: order.side,
      status: OrderStatus.FILLED,
      symbol: order.symbol,
      tradeQuantity: order.quantity,
      commission: commission,
      commissionAsset: order.side === OrderSide.BUY ? pair[0] : pair[1],
      // @todo:
      // It would be better to increment createTime with 1 interval or wait for the next candle to use `candle.start`.
      // or else the trade would be created in the ‘past'
      createTime: candle.start
    });
  }

  /**
   * Validates if any of the given orders could be filled by the given candle.
   * It will update both the trades$ and the openOrders$ stream
   * @param {Order[]} orders
   * @param {Candle} candle
   * @private
   */
  private fillOpenOrders(orders: OpenOrder[], candle: Candle): void {
    const scheduleForRemoval: string[] = [];

    orders.forEach((openOrder) => {
      const trade = this.createTradeFromOpenOrder(openOrder, candle);
      if (trade) this.trades$.next(trade);

      const order = this.createOrderFromOpenOrder(openOrder, candle);
      if (order) {
        this.orders$.next(order);
        scheduleForRemoval.push(order.clientOrderId);
      }
    });

    if (scheduleForRemoval.length > 0) this.removeOpenOrderByOrderIds(scheduleForRemoval);
  }

  /**
   * Removes all active open orders from openOrders$ by clientOrderId
   * @param {string[]} clientOrderIds
   * @private
   */
  private removeOpenOrderByOrderIds(clientOrderIds: string[]): void {
    if (clientOrderIds.length === 0) return;

    const orders = this._openOrders$.getValue();
    const newOrders = orders.filter(o => !clientOrderIds.includes(o.originalClientOrderId ?? '') && !clientOrderIds.includes(o.clientOrderId));

    if (orders.length !== newOrders.length) this._openOrders$.next(newOrders);
  }

  private createOpenOrder(orderCommand: OrderCommand): void {
    if (!orderCommand.price && orderCommand.type === OrderType.LIMIT) {
      throw new Error('Cannot create LIMIT order if no price is given');
    }

    const pair: Pair = this.getPair(orderCommand.symbol);
    const candle: Candle = this.getCandle(orderCommand.symbol);

    const price: number = orderCommand.type === OrderType.LIMIT
      ? <number>orderCommand.price
      : candle.close;

    this.wallet.updateSpotByOrderCommand(pair, orderCommand, price);

    this._openOrders$.next([
      ...this._openOrders$.getValue(),
      {
        clientOrderId: orderCommand.clientOrderId ? orderCommand.clientOrderId : nanoid(),
        price: orderCommand.type === OrderType.LIMIT ? orderCommand.price : undefined,
        quantity: orderCommand.quantity,
        side: orderCommand.side,
        status: OrderStatus.NEW,
        symbol: orderCommand.symbol,
        type: orderCommand.type,
        createTime: candle.start,
      }
    ]);
  }

}
