import {
  getCandles,
  getLastCandle,
  getCandleSets,
  getUniqueExchanges,
} from '@socktrader/core';
import { toTable } from './utils/toTable';
import { UDFSymbol } from './udf.interfaces';

export class UDF {
  supportedResolutions: string[] = [
    '1',
    '3',
    '5',
    '15',
    '30',
    '60',
    '120',
    '240',
    '360',
    '480',
    '720',
    '1D',
    '3D',
    '1W',
    '1M',
  ];

  symbols: UDFSymbol[] = [];

  constructor() {
    this.loadSymbols();
  }

  async loadSymbols() {
    const sets = await getCandleSets();
    this.symbols = sets.map((symbol) => {
      return {
        symbol: symbol.symbol.toUpperCase(),
        ticker: symbol.symbol,
        name: symbol.symbol,
        full_name: symbol.symbol,
        description: `${symbol.baseAsset} / ${symbol.quoteAsset}`,
        exchange: symbol.exchange.toUpperCase(),
        listed_exchange: symbol.exchange.toUpperCase(),
        type: 'crypto',
        currency_code: symbol.quoteAsset,
        session: '24x7',
        timezone: 'UTC',
        minmovement: 1,
        minmov: 1,
        minmovement2: 0,
        minmov2: 0,
        pricescale: Math.round(1 / parseFloat(symbol.tickSize)),
        supported_resolutions: ['60'],
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
        data_status: 'streaming',
      };
    });
  }

  hasSymbol(symbol: string): boolean {
    return !!this.symbols.find((s) => s.symbol === symbol);
  }

  /**
   * Data feed configuration data.
   */
  async config() {
    const exchanges = await getUniqueExchanges();
    return {
      exchanges: exchanges.map((e) => ({
        value: e.exchange.toUpperCase(),
        name: e.exchange,
        desc: e.description,
      })),
      symbols_types: [
        {
          value: 'crypto',
          name: 'Cryptocurrency',
        },
      ],
      supported_resolutions: this.supportedResolutions,
      supports_search: true,
      supports_group_request: false,
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true,
    };
  }

  /**
   * Returns symbol info as a table
   * eg: { a: [1,2,3], b: [4,5,6] }
   */
  symbolInfo() {
    return toTable(this.symbols);
  }

  /**
   * Symbol resolve.
   * @param {string} symbol Symbol name or ticker.
   * @returns {object} Symbol.
   */
  async symbol(symbol: string) {
    const result = this.symbols.find((s) => s.symbol === symbol);

    if (!result) {
      throw new Error('Symbol not found');
    }

    return result;
  }

  /**
   * Symbol search.
   * @param {string} query Text typed by the user in the Symbol Search edit box.
   * @param {string} type One of the symbol types supported by back-end.
   * @param {string} exchange One of the exchanges supported by back-end.
   * @param {number} limit The maximum number of symbols in a response.
   * @returns {array} Array of symbols.
   */
  async search(query: string, type: string, exchange: string, limit: number) {
    let symbols = this.symbols;

    if (type) {
      symbols = symbols.filter((s) => s.type === type);
    }

    if (exchange) {
      symbols = symbols.filter((s) => s.exchange === s.exchange);
    }

    query = query.toUpperCase();
    symbols = symbols.filter((s) => s.symbol.indexOf(query) >= 0);

    if (limit) {
      symbols = symbols.slice(0, limit);
    }

    return symbols.map((s) => ({
      symbol: s.symbol,
      full_name: s.full_name,
      description: s.description,
      exchange: s.exchange,
      ticker: s.ticker,
      type: s.type,
    }));
  }

  /**
   * Get chart history
   * @param {string} symbol - Symbol name or ticker.
   * @param {number} from - Unix timestamp (UTC) of leftmost required bar.
   * @param {number} to - Unix timestamp (UTC) of rightmost required bar.
   * @param {string} resolution
   * @param {number} countBack
   */
  async history(
    symbol: string,
    from: number,
    to: number,
    resolution: string,
    countBack: number
  ) {
    if (!this.hasSymbol(symbol)) {
      throw new Error('Symbol not found');
    }

    const candles = (
      await getCandles(
        symbol,
        new Date(from * 1000),
        new Date(to * 1000),
        countBack
      )
    ).map((c) => ({
      ...c,
      start: c.start.getTime() / 1000,
    }));

    if (candles.length <= 0) {
      const lastCandle = await getLastCandle(symbol, new Date(from * 1000));
      return lastCandle
        ? { s: 'no_data', nextTime: lastCandle.start.getTime() / 1000 }
        : { s: 'no_data' };
    }

    const table = toTable(candles);
    return {
      s: 'ok',
      t: table.start,
      c: table.close,
      o: table.open,
      h: table.high,
      l: table.low,
      v: table.volume,
    };
  }
}
