import { query } from '../db';

export const getUniqueExchanges = async () => {
  const result = await query(
    'SELECT DISTINCT ON (upper(exchange)) exchange, exchange_desc FROM candle_set;'
  );

  return result.rows.map((r) => ({
    exchange: r.exchange,
    description: r.exchange_desc,
  }));
};
