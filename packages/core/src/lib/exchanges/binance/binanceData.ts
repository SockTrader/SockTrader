import {
  Binance as BinanceInstance,
  Candle as BinanceCandle,
  ExchangeInfo,
  ExecutionReport,
  Order as BinanceOrder,
  Symbol as SymbolInfo,
  UserDataStreamEvent,
} from 'binance-api-node';
import { BehaviorSubject, filter, map, merge, Observable, share } from 'rxjs';
import {
  AssetDeltaUpdate,
  Candle,
  Order,
  Trade,
  WalletUpdate,
} from '../../interfaces';
import {
  CandleOptions,
  isAssetUpdate,
  isExecutionReport,
  isMarketOrder,
  isOrder,
  isTrade,
  isWalletUpdate,
} from './binance.interfaces';
import {
  mapAssetUpdate,
  mapCandle,
  mapExecutionReportToOrder,
  mapExecutionReportToTrade,
  mapOrderResponse,
  mapWalletUpdate,
} from './mapper';
import { log } from '../../utils';

/**
 * Contains all binance data streams
 */
export class BinanceData {
  readonly _userInfo$ = new Observable<UserDataStreamEvent>((subscriber) => {
    this._binance.ws.user((msg: UserDataStreamEvent) => subscriber.next(msg));
  }).pipe(log('User info'), share());

  readonly assetUpdate$: Observable<AssetDeltaUpdate> = this._userInfo$.pipe(
    filter(isAssetUpdate),
    map(mapAssetUpdate)
  );

  readonly walletUpdate$: Observable<WalletUpdate[]> = this._userInfo$.pipe(
    filter(isWalletUpdate),
    map(mapWalletUpdate)
  );

  private readonly _exchangeInfo$ = new BehaviorSubject<
    ExchangeInfo | undefined
  >(undefined);

  private readonly _marketOrders$ = new BehaviorSubject<Order | undefined>(
    undefined
  );

  readonly orders$: Observable<Order> = merge(
    this._marketOrders$.pipe(filter((v): v is Order => !!v)),
    this._userInfo$.pipe(
      filter(
        (msg): msg is ExecutionReport => isExecutionReport(msg) && isOrder(msg)
      ),
      filter((trade) => !isMarketOrder(trade)),
      map(mapExecutionReportToOrder)
    )
  );

  private readonly _marketTrades$ = new BehaviorSubject<Trade | undefined>(
    undefined
  );

  readonly trades$: Observable<Trade> = merge(
    this._marketTrades$.pipe(filter((v): v is Trade => !!v)),
    this._userInfo$.pipe(
      filter(
        (msg): msg is ExecutionReport => isExecutionReport(msg) && isTrade(msg)
      ),
      filter((trade) => !isMarketOrder(trade)),
      map(mapExecutionReportToTrade)
    )
  );

  constructor(private readonly _binance: BinanceInstance) {}

  /**
   * Loads ExchangeInfo into internal cache object. Can be re-used later
   * on to load rateLimits / symbols / filters etc..
   * @returns {Promise<void>}
   */
  async loadExchangeInfo(): Promise<void> {
    const exchangeInfo = await this._binance.exchangeInfo();
    this._exchangeInfo$.next(exchangeInfo);
  }

  /**
   * Reads Symbol info from the internal cache
   * @param {string} symbol
   * @returns {Observable<SymbolInfo>}
   */
  getSymbol(symbol: string): Observable<SymbolInfo> {
    return this._exchangeInfo$.pipe(
      map((info) => {
        const sym = info?.symbols.find((info) => info.symbol === symbol);
        if (!sym)
          throw new Error(
            `Could not find Symbol information on Binance for ${symbol}`
          );
        return sym;
      })
    );
  }

  /**
   * Returns a candle observable. Note that each subscriber will cause a separate
   * connection to the websocket server!
   * @param {CandleOptions} options
   * @returns {Observable<Candle>}
   */
  candles(options: CandleOptions): Observable<Candle> {
    return new Observable<BinanceCandle>((subscriber) => {
      this._binance.ws.candles(options.symbol, options.interval, (candle) => {
        subscriber.next(candle);
      });
    }).pipe(
      filter((c) => c.isFinal),
      map((candle) => mapCandle(candle))
    );
  }

  /**
   * We should extract Trade & Order stream updates directly from the OrderResponse for MARKET orders.
   * Since Binance is not returning a proper response in the UserDataStreamEvent for MARKET orders.
   * eg: it's missing correct price data and individual trades
   * @param {BinanceOrder} orderResponse
   */
  extractStreamUpdatesFromMarketOrder(orderResponse: BinanceOrder): void {
    const result = mapOrderResponse(orderResponse);
    if (result) {
      this._marketOrders$.next(result.order);
      result.trades.forEach((trade) => this._marketTrades$.next(trade));
    }
  }
}
