import { query } from '../db';
import { Trade } from '../interfaces/trade.interfaces';

export const insertTrade = (t: Trade) => {
  return query(`
      INSERT INTO trades(symbol, "clientOrderId", "originalClientOrderId", price, quantity, side, status, "tradeQuantity", commission,
                         "commissionAsset", "createTime")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [t.symbol, t.clientOrderId, t.originalClientOrderId, t.price, t.quantity, t.side, t.status, t.tradeQuantity, t.commission, t.commissionAsset, t.createTime]
  );
};
