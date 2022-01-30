import config from 'config';
import { Binance as BinanceInstance, default as BinanceExchange, Symbol as SymbolInfo } from 'binance-api-node';
import { Observable } from 'rxjs';
import { Candle } from '../../core/candle.interfaces';
import { Exchange } from '../../core/exchange.interfaces';
import { Order, OrderCommand, OrderSide } from '../../core/order.interfaces';
import { Trade } from '../../core/trade.interfaces';
import WalletService from '../../core/wallet/wallet.service';
import { CandleOptions } from './binance.interfaces';
import BinanceData from './binanceData';
import BinanceError from './binanceError';
import BinanceErrorHandler from './binanceErrorHandler';
import { mapOrderCommand } from './mapper';

export default class Binance implements Exchange {

  protected _binance: BinanceInstance = BinanceExchange({
    ...config.get('exchanges.binance')
  });

  private readonly _data: BinanceData = new BinanceData(this._binance);

  private readonly _errorHandler: BinanceErrorHandler = new BinanceErrorHandler();

  readonly wallet: WalletService = new WalletService();

  readonly orders$: Observable<Order> = this._data.orders$;

  readonly trades$: Observable<Trade> = this._data.trades$;

  constructor() {
    this._data.loadExchangeInfo();

    this._data.walletUpdate$.subscribe(update => this.wallet.updateSpotByWalletUpdate(update));
    this._data.assetUpdate$.subscribe(update => this.wallet.updateSpotByAssetDeltaUpdate(update));
  }

  candles(options: CandleOptions): Observable<Candle> {
    return this._data.candles(options);
  }

  getSymbol(symbol: string): Observable<SymbolInfo> {
    return this._data.getSymbol(symbol);
  }

  async buy(orderCommand: Omit<OrderCommand, 'side'>): Promise<void> {
    const buyCommand = { ...orderCommand, side: OrderSide.BUY };

    try {
      const orderResponse = await this._binance.order(mapOrderCommand(buyCommand));
      this._data.extractStreamUpdatesFromMarketOrder(orderResponse);
    } catch (error: unknown) {
      this._errorHandler.handle(new BinanceError(error, buyCommand));
    }
  }

  async buyMargin(): Promise<never> {
    throw new Error('margin trading is not supported yet');
  }

  async sell(orderCommand: Omit<OrderCommand, 'side'>): Promise<void> {
    const sellCommand = { ...orderCommand, side: OrderSide.SELL };

    try {
      const orderResponse = await this._binance.order(mapOrderCommand(sellCommand));
      this._data.extractStreamUpdatesFromMarketOrder(orderResponse);
    } catch (error) {
      this._errorHandler.handle(new BinanceError(error, sellCommand));
    }
  }

  async sellMargin(): Promise<never> {
    throw new Error('margin trading is not supported yet');
  }

}
