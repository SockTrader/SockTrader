import {
  Binance as BinanceInstance,
  default as BinanceExchange,
  Symbol as SymbolInfo,
} from 'binance-api-node';
import config from 'config';
import { Observable } from 'rxjs';
import {
  Candle,
  Exchange,
  Order,
  OrderCommand,
  OrderSide,
  Trade,
} from '../../interfaces';
import { WalletService } from '../../wallet';
import { CandleOptions } from './binance.interfaces';
import { BinanceData } from './binanceData';
import { BinanceError } from './binanceError';
import { BinanceErrorHandler } from './binanceErrorHandler';
import { mapOrderCommand } from './mapper';

export class Binance implements Exchange {
  readonly wallet: WalletService = new WalletService();

  protected _binance: BinanceInstance = BinanceExchange({
    ...config.get('exchanges.binance'),
  });

  private readonly _data: BinanceData = new BinanceData(this._binance);

  readonly orders$: Observable<Order> = this._data.orders$;

  readonly trades$: Observable<Trade> = this._data.trades$;

  private readonly _errorHandler: BinanceErrorHandler =
    new BinanceErrorHandler();

  constructor() {
    this._data.loadExchangeInfo();

    this._data.walletUpdate$.subscribe((update) =>
      this.wallet.updateSpotByWalletUpdate(update)
    );
    this._data.assetUpdate$.subscribe((update) =>
      this.wallet.updateSpotByAssetDeltaUpdate(update)
    );
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
      const orderResponse = await this._binance.order(
        mapOrderCommand(buyCommand)
      );
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
      const orderResponse = await this._binance.order(
        mapOrderCommand(sellCommand)
      );
      this._data.extractStreamUpdatesFromMarketOrder(orderResponse);
    } catch (error) {
      this._errorHandler.handle(new BinanceError(error, sellCommand));
    }
  }

  async sellMargin(): Promise<never> {
    throw new Error('margin trading is not supported yet');
  }
}
