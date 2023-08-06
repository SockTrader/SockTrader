import { Observable } from 'rxjs';
import { Candle } from './candle.interfaces';
import { Order, OrderCommand } from './order.interfaces';
import { Trade } from './trade.interfaces';
import { WalletService } from '../wallet';

export interface Exchange {
  candles(options: unknown): Observable<Candle>;

  buy(orderCommand: Omit<OrderCommand, 'side'>): Promise<void>;

  buyMargin(): Promise<void>;

  sell(orderCommand: Omit<OrderCommand, 'side'>): Promise<void>;

  sellMargin(): Promise<void>;

  orders$: Observable<Order>;

  trades$: Observable<Trade>;

  wallet: WalletService;
}
