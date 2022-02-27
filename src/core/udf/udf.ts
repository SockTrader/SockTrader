export class UDFError extends Error {
}

export class SymbolNotFound extends UDFError {
}

export class InvalidResolution extends UDFError {
}

export class UDF {

  private supportedResolutions: string[] = ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'];

  constructor() {
    setInterval(() => {
      this.loadSymbols();
    }, 30000);
    this.loadSymbols();
  }

  loadSymbols() {
    function pricescale(symbol) {
      for (const filter of symbol.filters) {
        if (filter.filterType == 'PRICE_FILTER') {
          return Math.round(1 / parseFloat(filter.tickSize));
        }
      }
      return 1;
    }

    const promise = this.binance.exchangeInfo().catch(err => {
      console.error(err);
      setTimeout(() => {
        this.loadSymbols();
      }, 1000);
    });

    this.symbols = promise.then(info => {
      return info.symbols.map(symbol => {
        return {
          symbol: symbol.symbol,
          ticker: symbol.symbol,
          name: symbol.symbol,
          full_name: symbol.symbol,
          description: `${symbol.baseAsset} / ${symbol.quoteAsset}`,
          exchange: 'BINANCE',
          listed_exchange: 'BINANCE',
          type: 'crypto',
          currency_code: symbol.quoteAsset,
          session: '24x7',
          timezone: 'UTC',
          minmovement: 1,
          minmov: 1,
          minmovement2: 0,
          minmov2: 0,
          pricescale: pricescale(symbol),
          supported_resolutions: this.supportedResolutions,
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          data_status: 'streaming'
        };
      });
    });
    this.allSymbols = promise.then(info => {
      const set = new Set();
      for (const symbol of info.symbols) {
        set.add(symbol.symbol);
      }
      return set;
    });
  }

  async checkSymbol(symbol) {
    const symbols = await this.allSymbols;
    return symbols.has(symbol);
  }

  /**
   * Convert items to response-as-a-table format.
   * @param {array} items - Items to convert.
   * @returns {object} Response-as-a-table formatted items.
   */
  asTable(items) {
    const result = {};
    for (const item of items) {
      for (const key in item) {
        if (!result[key]) {
          result[key] = [];
        }
        result[key].push(item[key]);
      }
    }
    for (const key in result) {
      const values = [...new Set(result[key])];
      if (values.length === 1) {
        result[key] = values[0];
      }
    }
    return result;
  }

  /**
   * Data feed configuration data.
   */
  async config() {
    return {
      exchanges: [
        {
          value: 'BINANCE',
          name: 'Binance',
          desc: 'Binance Exchange'
        }
      ],
      symbols_types: [
        {
          value: 'crypto',
          name: 'Cryptocurrency'
        }
      ],
      supported_resolutions: this.supportedResolutions,
      supports_search: true,
      supports_group_request: false,
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true
    };
  }

  /**
   * Symbols.
   * @returns {object} Response-as-a-table formatted symbols.
   */
  async symbolInfo() {
    const symbols = await this.symbols;
    return this.asTable(symbols);
  }

  /**
   * Symbol resolve.
   * @param {string} symbol Symbol name or ticker.
   * @returns {object} Symbol.
   */
  async symbol(symbol) {
    const symbols = await this.symbols;

    const comps = symbol.split(':');
    const s = (comps.length > 1 ? comps[1] : symbol).toUpperCase();

    for (const symbol of symbols) {
      if (symbol.symbol === s) {
        return symbol;
      }
    }

    throw new SymbolNotFound();
  }

  /**
   * Symbol search.
   * @param {string} query Text typed by the user in the Symbol Search edit box.
   * @param {string} type One of the symbol types supported by back-end.
   * @param {string} exchange One of the exchanges supported by back-end.
   * @param {number} limit The maximum number of symbols in a response.
   * @returns {array} Array of symbols.
   */
  async search(query, type, exchange, limit) {
    let symbols = await this.symbols;
    if (type) {
      symbols = symbols.filter(s => s.type === type);
    }
    if (exchange) {
      symbols = symbols.filter(s => s.exchange === exchange);
    }

    query = query.toUpperCase();
    symbols = symbols.filter(s => s.symbol.indexOf(query) >= 0);

    if (limit) {
      symbols = symbols.slice(0, limit);
    }
    return symbols.map(s => ({
      symbol: s.symbol,
      full_name: s.full_name,
      description: s.description,
      exchange: s.exchange,
      ticker: s.ticker,
      type: s.type
    }));
  }

  /**
   * Bars.
   * @param {string} symbol - Symbol name or ticker.
   * @param {number} from - Unix timestamp (UTC) of leftmost required bar.
   * @param {number} to - Unix timestamp (UTC) of rightmost required bar.
   * @param {string} resolution
   */
  async history(symbol, from, to, resolution) {
    const hasSymbol = await this.checkSymbol(symbol);
    if (!hasSymbol) {
      throw new SymbolNotFound();
    }

    const RESOLUTIONS_INTERVALS_MAP = {
      '1': '1m',
      '3': '3m',
      '5': '5m',
      '15': '15m',
      '30': '30m',
      '60': '1h',
      '120': '2h',
      '240': '4h',
      '360': '6h',
      '480': '8h',
      '720': '12h',
      'D': '1d',
      '1D': '1d',
      '3D': '3d',
      'W': '1w',
      '1W': '1w',
      'M': '1M',
      '1M': '1M',
    };

    const interval = RESOLUTIONS_INTERVALS_MAP[resolution];
    if (!interval) {
      throw new InvalidResolution();
    }

    let totalKlines = [];

    from *= 1000;
    to *= 1000;

    while (true) {
      const klines = await this.binance.klines(symbol, interval, from, to, 500);
      totalKlines = totalKlines.concat(klines);
      if (klines.length == 500) {
        from = klines[klines.length - 1][0] + 1;
      } else {
        if (totalKlines.length === 0) {
          return { s: 'no_data' };
        } else {
          return {
            s: 'ok',
            t: totalKlines.map(b => Math.floor(b[0] / 1000)),
            c: totalKlines.map(b => parseFloat(b[4])),
            o: totalKlines.map(b => parseFloat(b[1])),
            h: totalKlines.map(b => parseFloat(b[2])),
            l: totalKlines.map(b => parseFloat(b[3])),
            v: totalKlines.map(b => parseFloat(b[5]))
          };
        }
      }
    }
  }

}
