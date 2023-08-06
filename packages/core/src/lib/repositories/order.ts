import { query } from '../db';
import { Order } from '../interfaces';

export const insertOrder = (o: Order) => {
  return query(
    `
      INSERT INTO orders(symbol, client_order_id, original_client_order_id, price, quantity, status, type, side, create_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      o.symbol,
      o.clientOrderId,
      o.originalClientOrderId,
      o.price,
      o.quantity,
      o.status,
      o.type,
      o.side,
      o.createTime,
    ]
  );
};
