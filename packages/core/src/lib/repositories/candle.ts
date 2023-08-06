import { query } from '../db';
import { Candle } from '../interfaces';

const mapResultToCandle = (r: any): Candle => {
  return {
    start: r.start,
    open: r.open,
    high: r.high,
    low: r.low,
    close: r.close,
    volume: parseFloat(r.volume),
  };
};

/**
 * Selects all candles for a certain symbol between from and to.
 * @param {string} symbol
 * @param {Date} from
 * @param {Date} to
 * @param {number} countBack
 * @returns {Promise<Candle[]>}
 */
export const getCandles = async (
  symbol: string,
  from: Date,
  to: Date,
  countBack?: number
): Promise<Candle[]> => {
  const result = countBack
    ? await query(
        `
      SELECT *
      FROM (
             SELECT c.*
             FROM candles AS c
                    INNER JOIN candle_set cs on cs.id = c.fk_candle_set
             WHERE cs.symbol = $1
               AND c.start <= $2
             ORDER BY c.start DESC
             LIMIT $3
           ) t
      ORDER BY t.start ASC
    `,
        [symbol, to, countBack]
      )
    : await query(
        `
      SELECT c.*
      FROM candles AS c
             INNER JOIN candle_set cs on cs.id = c.fk_candle_set
      WHERE cs.symbol = $1
        AND c.start BETWEEN $2 and $3
      ORDER BY c.start ASC
    `,
        [symbol, from, to]
      );

  return result.rows.map(mapResultToCandle);
};

export const getLastCandle = async (
  symbol: string,
  before: Date
): Promise<Candle | null> => {
  const result = await query(
    `
    SELECT *
    FROM candles as c
           INNER JOIN candle_set cs on cs.id = c.fk_candle_set
    WHERE cs.symbol = $1
      AND c.start <= $2
    ORDER BY c.start DESC
    LIMIT 1
  `,
    [symbol, before]
  );

  return result.rows.length > 0 ? mapResultToCandle(result.rows[0]) : null;
};
