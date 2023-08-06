import { ExchangeInfo, TradingType, OrderType } from 'binance-api-node';

export const binanceExchangeInfoMock: ExchangeInfo = {
  timezone: 'UTC',
  serverTime: 1565246363776,
  rateLimits: [
    // {
    //   These are defined in the `ENUM definitions` section under `Rate Limiters (rateLimitType)`.
    //  All limits are optional
    // }
  ],
  exchangeFilters: [
    //These are the defined filters in the `Filters` section.
    //All filters are optional.
  ],
  symbols: [
    {
      baseAsset: 'BTC',
      pricePrecision: 8,
      quantityPrecision: 8,
      baseAssetPrecision: 8,
      baseCommissionPrecision: 8,
      quoteCommissionPrecision: 8,
      quoteOrderQtyMarketAllowed: true,
      symbol: 'BTCUSDT',
      status: 'TRADING',
      quoteAsset: 'USDT',
      quotePrecision: 8,
      quoteAssetPrecision: 8,
      orderTypes: [
        <OrderType>'LIMIT',
        <OrderType>'LIMIT_MAKER',
        <OrderType>'MARKET',
        <OrderType>'STOP_MARKET',
        <OrderType>'STOP_LOSS_LIMIT',
        <OrderType>'TAKE_PROFIT_MARKET',
        <OrderType>'TAKE_PROFIT_LIMIT',
      ],
      icebergAllowed: true,
      ocoAllowed: true,
      isSpotTradingAllowed: true,
      isMarginTradingAllowed: true,
      filters: [
        //These are defined in the Filters section.
        //All filters are optional
      ],
      permissions: [<TradingType>'SPOT', <TradingType>'MARGIN'],
    },
  ],
};
