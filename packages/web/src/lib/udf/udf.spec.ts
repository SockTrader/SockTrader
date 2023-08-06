import { UDF } from './udf';
import { UDFSymbol } from './udf.interfaces';

const baseSymbol = {
  exchange: 'BINANCE',
  listed_exchange: 'BINANCE',
  type: 'crypto',
  session: '24x7',
  timezone: 'UTC',
  minmovement: 1,
  minmov: 1,
  minmovement2: 0,
  minmov2: 0,
  pricescale: Math.round(1 / 0.01),
  supported_resolutions: ['1h', '4h'],
  has_intraday: true,
  has_daily: true,
  has_weekly_and_monthly: true,
  data_status: 'streaming',
};

describe('UDF', () => {
  let service: UDF;

  beforeEach(() => {
    service = new UDF();
    service.symbols = [
      {
        ...baseSymbol,
        symbol: 'BTCUSD',
        ticker: 'BTCUSD',
        name: 'BTCUSD',
        full_name: 'BTCUSD',
        description: 'BTC / USD',
        currency_code: 'USD',
      } as UDFSymbol,
      {
        ...baseSymbol,
        symbol: 'ETHUSDT',
        ticker: 'ETHUSDT',
        name: 'ETHUSDT',
        full_name: 'ETHUSDT',
        description: 'ETH / USDT',
        currency_code: 'USDT',
        has_daily: false,
        has_intraday: false,
        has_weekly_and_monthly: false,
      } as UDFSymbol,
    ];
  });

  it('Should return symbolInfo as a table response', () => {
    expect(service.symbolInfo()).toEqual({
      currency_code: ['USD', 'USDT'],
      data_status: ['streaming', 'streaming'],
      description: ['BTC / USD', 'ETH / USDT'],
      exchange: ['BINANCE', 'BINANCE'],
      full_name: ['BTCUSD', 'ETHUSDT'],
      has_daily: [true, false],
      has_intraday: [true, false],
      has_weekly_and_monthly: [true, false],
      listed_exchange: ['BINANCE', 'BINANCE'],
      minmov: [1, 1],
      minmov2: [0, 0],
      minmovement: [1, 1],
      minmovement2: [0, 0],
      name: ['BTCUSD', 'ETHUSDT'],
      pricescale: [100, 100],
      session: ['24x7', '24x7'],
      supported_resolutions: [
        ['1h', '4h'],
        ['1h', '4h'],
      ],
      symbol: ['BTCUSD', 'ETHUSDT'],
      ticker: ['BTCUSD', 'ETHUSDT'],
      timezone: ['UTC', 'UTC'],
      type: ['crypto', 'crypto'],
    });
  });
});
