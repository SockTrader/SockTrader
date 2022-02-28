import { query } from '../db';
import { Order } from '../interfaces/order.interfaces';

export const insertOrder = (o: Order) => {
  return query(`
      INSERT INTO orders(symbol, "clientOrderId", "originalClientOrderId", price, quantity, status, type, side, "createTime")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [o.symbol, o.clientOrderId, o.originalClientOrderId, o.price, o.quantity, o.status, o.type, o.side, o.createTime]
  );
};
