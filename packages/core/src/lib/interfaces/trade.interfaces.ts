import { OrderSide, OrderStatus } from './order.interfaces';

export interface Trade {
  clientOrderId: string;
  originalClientOrderId?: string;
  price: number;
  quantity: number;
  side: OrderSide;
  status: OrderStatus;
  symbol: string;
  tradeQuantity: number;
  commission?: number;
  commissionAsset?: string;
  createTime: Date;
}
