import { Order } from '../../core/interfaces/order.interfaces';

export interface OpenOrder extends Omit<Order, 'price'> {
  price?: number
}
