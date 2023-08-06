import { query } from '../db';
import { Trade } from '../interfaces';

export const insertTrade = (t: Trade) => {
  return query(
    `
      INSERT INTO trades(symbol, client_order_id, original_client_order_id, price, quantity, side, status, trade_quantity, commission,
                         commission_asset, create_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      t.symbol,
      t.clientOrderId,
      t.originalClientOrderId,
      t.price,
      t.quantity,
      t.side,
      t.status,
      t.tradeQuantity,
      t.commission,
      t.commissionAsset,
      t.createTime,
    ]
  );
};
