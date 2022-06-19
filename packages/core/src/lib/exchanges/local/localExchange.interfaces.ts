import { Order } from '../../interfaces'

export interface OpenOrder extends Omit<Order, 'price'> {
  price?: number;
}

export interface LocalExchangeCandleOptions {
  symbol: string[];
}
