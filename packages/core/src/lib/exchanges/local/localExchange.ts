import {
  asyncScheduler,
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  from,
  map,
  Observable,
  scheduled,
  Subject,
  tap,
} from 'rxjs';
import {
  Asset,
  Candle,
  Exchange,
  Order,
  OrderCommand,
  OrderSide,
  OrderStatus,
  OrderType,
  Pair,
  Trade,
} from '../../interfaces';
import { WalletService } from '../../wallet';
import { OpenOrder } from './localExchange.interfaces';
import { mapOpenOrderToOrder, mapOrderCommandToOpenOrder } from './mapper';
import {
  calculateOrderPrice,
  createOrderFromOpenOrder,
  createTradeFromOpenOrder,
} from './utils';

export class LocalExchange implements Exchange {
  readonly wallet: WalletService = new WalletService();

  /**
   * Contains a mapping of all registered candles per asset.
   * Only 1 set of candles per asset can be registered.
   * @type {Map<string, Candle[]>}
   */
  readonly _symbolWithCandles: Map<string, Candle[]> = new Map<
    string,
    Candle[]
  >();

  /**
   * Translation table between "BTCUSDT" and ["BTC", "USDT"]
   * @type {Map<string, Pair>}
   */
  readonly _symbolWithPair: Map<string, Pair> = new Map<string, Pair>();

  /**
   * Keeps track of the current candle for each trading pair when iterating
   * Note: this could potentially lead to async issues
   * @type {Map<string, Candle>}
   */
  readonly _symbolWithCurrentCandle: Map<string, Candle> = new Map<
    string,
    Candle
  >();

  /**
   * Trade stream
   * @type {Observable<Trade>}
   */
  readonly trades$: Subject<Trade> = new Subject<Trade>();

  /**
   * Order stream
   * @type {Observable<Order>}
   * @type {<Order>}
   */
  readonly orders$: Subject<Order> = new Subject<Order>();

  private readonly openOrders$: BehaviorSubject<OpenOrder[]> =
    new BehaviorSubject<OpenOrder[]>([]);

  constructor() {
    this.trades$.subscribe((trade: Trade) => {
      const pair: Pair = this.getPair(trade.symbol);
      this.wallet.updateSpotByTrade(trade, pair);
    });
  }

  candles(symbol: string): Observable<Candle> {
    const candles = this._symbolWithCandles.get(symbol);

    if (candles == null) {
      throw new Error(`No candles added to local exchange for "${symbol}"`);
    }

    return combineLatest([
      scheduled(from(candles), asyncScheduler),
      this.openOrders$.pipe(
        map((orderList) => orderList.filter((o) => o.symbol === symbol))
      ),
    ]).pipe(
      tap(([candle, openOrders]) => this.fillOpenOrders(openOrders, candle)),
      tap(([candle]) => this._symbolWithCurrentCandle.set(symbol, candle)),
      map(([candle]) => candle),
      // The distinctUntilChanged would prevent similar candles from leaking into the stream. Since OpenOrders$ could emit multiple times
      distinctUntilChanged(
        (prev, curr) => prev.start.getTime() === curr.start.getTime()
      )
    );
  }

  async buy(orderCommand: Omit<OrderCommand, 'side'>): Promise<void> {
    this.createOpenOrder({
      ...orderCommand,
      side: OrderSide.BUY,
    });

    return Promise.resolve();
  }

  async buyMargin(): Promise<never> {
    throw new Error('margin trading is not supported yet');
  }

  async sell(orderCommand: Omit<OrderCommand, 'side'>): Promise<void> {
    this.createOpenOrder({
      ...orderCommand,
      side: OrderSide.SELL,
    });
  }

  async sellMargin(): Promise<never> {
    throw new Error('margin trading is not supported yet');
  }

  addCandles(pair: Pair, candles: Candle[]): void {
    const symbol: string = pair[0] + pair[1];

    if (candles.length <= 0)
      throw new Error('Candle array should contain at least 1 candle');
    if (this._symbolWithCandles.get(symbol))
      throw new Error(`A set of candles has already been added for ${symbol}`);

    const first = candles[0]?.start?.getTime();
    const last = candles[candles.length - 1].start.getTime();

    this._symbolWithPair.set(symbol, pair);
    this._symbolWithCandles.set(
      symbol,
      first > last ? candles.reverse() : candles
    );
  }

  setAssets(initialWallet: Asset[]): void {
    this.wallet.setInitialWallet(initialWallet);
  }

  private getPair(symbol: string): Pair {
    const pair = this._symbolWithPair.get(symbol);

    if (pair == null) throw new Error(`No pair could be found for ${symbol}`);
    return pair;
  }

  private getCandle(symbol: string): Candle {
    const candle = this._symbolWithCurrentCandle.get(symbol);

    if (candle == null)
      throw new Error(`No active candle could be found for ${symbol}`);
    return candle;
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
      const pair: Pair = this.getPair(openOrder.symbol);
      const orderPrice: number = calculateOrderPrice(openOrder, candle);

      const order = createOrderFromOpenOrder(
        openOrder,
        candle,
        pair,
        orderPrice
      );
      if (order) {
        this.orders$.next(<Order>{ ...order, status: OrderStatus.FILLED });
        scheduleForRemoval.push(order.clientOrderId);
      }

      const trade = createTradeFromOpenOrder(
        openOrder,
        candle,
        pair,
        orderPrice
      );
      if (trade) this.trades$.next(trade);
    });

    if (scheduleForRemoval.length > 0)
      this.removeOpenOrderByOrderIds(scheduleForRemoval);
  }

  /**
   * Removes all active open orders from openOrders$ by clientOrderId
   * @param {string[]} clientOrderIds
   * @private
   */
  private removeOpenOrderByOrderIds(clientOrderIds: string[]): void {
    if (clientOrderIds.length === 0) return;

    const orders = this.openOrders$.getValue();
    const newOrders = orders.filter(
      (o) =>
        !clientOrderIds.includes(o.originalClientOrderId ?? '') &&
        !clientOrderIds.includes(o.clientOrderId)
    );

    if (orders.length !== newOrders.length) this.openOrders$.next(newOrders);
  }

  private createOpenOrder(orderCommand: OrderCommand): void {
    if (!orderCommand.price && orderCommand.type === OrderType.LIMIT) {
      throw new Error('Cannot create LIMIT order if no price is given');
    }

    const pair: Pair = this.getPair(orderCommand.symbol);
    const candle: Candle = this.getCandle(orderCommand.symbol);

    this.wallet.updateSpotByOrderCommand(pair, orderCommand, candle);

    const openOrder = mapOrderCommandToOpenOrder(orderCommand, candle);

    this.emitNewOrder(openOrder, candle, pair);
    this.openOrders$.next([...this.openOrders$.getValue(), openOrder]);
  }

  private emitNewOrder(openOrder: OpenOrder, candle: Candle, pair: Pair) {
    if (openOrder.type === OrderType.LIMIT) {
      const orderPrice = calculateOrderPrice(openOrder, candle);
      const order = mapOpenOrderToOrder(openOrder, candle, pair, orderPrice);
      this.orders$.next(<Order>{ ...order, status: OrderStatus.NEW });
    }
  }
}
