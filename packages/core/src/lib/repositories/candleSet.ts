import { query } from '../db';

export const getCandleSets = async () => {
  const result = await query('SELECT * FROM candle_set');

  return result.rows.map((r) => {
    return {
      interval: r.interval,
      symbol: r.symbol,
      baseAsset: r.base_asset,
      quoteAsset: r.quote_asset,
      tickSize: r.tick_size,
      exchange: r.exchange,
      exchangeDescription: r.exchange_desc,
    };
  });
};
