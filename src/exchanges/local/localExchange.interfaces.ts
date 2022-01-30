import { Order } from '../../core/order.interfaces';

export interface OpenOrder extends Omit<Order, 'price'> {
  price?: number
}
