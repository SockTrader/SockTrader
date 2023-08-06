import { Order } from '../../interfaces';

export interface OpenOrder extends Omit<Order, 'price'> {
  price?: number;
}
