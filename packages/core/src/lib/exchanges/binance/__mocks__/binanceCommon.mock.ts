import {
  ExecutionReport,
  ExecutionType,
  Order,
  ExecutionType_LT,
  OrderSide_LT,
  TimeInForce_LT,
  OrderStatus_LT,
  OrderType_LT,
  FuturesOrderType_LT,
  OrderRejectReason,
} from 'binance-api-node';

export const mockCommonMarketBuyOrderResponse: Order = {
  symbol: 'BTCUSDT',
  orderId: 7510602297,
  orderListId: -1, //Unless OCO, value will be -1
  clientOrderId: 'C5Y3nTK24OQpnbwNYXhMUO',
  transactTime: new Date('2020-02-24T12:00:00').getTime(),
  price: '0.00000000',
  origQty: '1.00000000',
  executedQty: '1.00000000',
  cummulativeQuoteQty: '1.00000000',
  isWorking: true,
  updateTime: 1582542000000,
  time: new Date('2020-02-24T12:00:00').getTime(),
  status: <OrderStatus_LT>'FILLED',
  timeInForce: <TimeInForce_LT>'GTC',
  type: <OrderType_LT>'MARKET',
  side: <OrderSide_LT>'BUY',
  fills: [
    {
      tradeId: 1,
      price: '9800.00000000',
      qty: '1.00000000',
      commission: '0.00100000',
      commissionAsset: 'BTC',
    },
  ],
};

export const mockCommonMarketSellOrderResponse: Order = {
  symbol: 'BTCUSDT',
  orderId: 7510602298,
  orderListId: -1, //Unless OCO, value will be -1
  clientOrderId: 'd3j3NZQ99OQpnbwNYXhMUO',
  transactTime: new Date('2020-02-24T13:00:00').getTime(),
  price: '0.00000000',
  origQty: '1.00000000',
  executedQty: '1.00000000',
  cummulativeQuoteQty: '1.00000000',
  isWorking: true,
  updateTime: 1582545600000,
  time: new Date('2020-02-24T13:00:00').getTime(),
  status: <OrderStatus_LT>'FILLED',
  timeInForce: <TimeInForce_LT>'GTC',
  type: <OrderType_LT>'MARKET',
  side: <OrderSide_LT>'SELL',
  fills: [
    {
      tradeId: 1,
      price: '9750.42000000',
      qty: '1.00000000',
      commission: '9.75042000',
      commissionAsset: 'USDT',
    },
  ],
};

export const mockCommonLimitNewBuyOrder = (report?: Partial<ExecutionReport>): ExecutionReport => ({
  eventType: <ExecutionReport['eventType']>'executionReport',
  eventTime: 1582549200000,
  symbol: 'BTCUSDT',
  newClientOrderId: 'web_4a64263cfd544a6c8ed40856dc9fee04',
  originalClientOrderId: '',
  side: <OrderSide_LT>'BUY',
  orderType: <FuturesOrderType_LT>'LIMIT',
  timeInForce: <TimeInForce_LT>'GTC',
  quantity: '1.00000000',
  price: '9700.00000000',
  executionType: <ExecutionType>'NEW',
  stopPrice: '0.00000000',
  icebergQuantity: '0.00000000',
  orderStatus: <OrderStatus_LT>'NEW',
  orderRejectReason: <OrderRejectReason>'NONE',
  orderId: 7510602299,
  orderTime: new Date('2020-02-24T14:00:00').getTime(),
  lastTradeQuantity: '0.00000000',
  totalTradeQuantity: '0.00000000',
  priceLastTrade: '0.00000000',
  commission: '0',
  commissionAsset: null,
  tradeId: -1,
  isOrderWorking: true,
  isBuyerMaker: false,
  creationTime: new Date('2020-02-24T14:00:00').getTime(),
  totalQuoteTradeQuantity: '0.00000000',
  orderListId: -1,
  quoteOrderQuantity: '0.00000000',
  lastQuoteTransacted: '0.00000000',
  ...report,
});

export const mockCommonLimitFilledBuyOrder = (report?: Partial<ExecutionReport>): ExecutionReport => ({
  eventType: <ExecutionReport['eventType']>'executionReport',
  eventTime: 1582549260000,
  symbol: 'BTCUSDT',
  newClientOrderId: 'web_4a64263cfd544a6c8ed40856dc9fee04',
  originalClientOrderId: '',
  side: <OrderSide_LT>'BUY',
  orderType: <FuturesOrderType_LT>'LIMIT',
  timeInForce: <TimeInForce_LT>'GTC',
  quantity: '1.00000000',
  price: '9700.00000000',
  executionType: <ExecutionType_LT>'TRADE',
  stopPrice: '0.00000000',
  icebergQuantity: '0.00000000',
  orderStatus: <OrderStatus_LT>'FILLED',
  orderRejectReason: <OrderRejectReason>'NONE',
  orderId: 7510602299,
  orderTime: new Date('2020-02-24T15:00:00').getTime(),
  lastTradeQuantity: '1.00000000',
  totalTradeQuantity: '0.00000000',
  priceLastTrade: '0.00000000',
  commission: '0.00100000',
  commissionAsset: 'BTC',
  tradeId: -1,
  isOrderWorking: true,
  isBuyerMaker: false,
  creationTime: new Date('2020-02-24T14:00:00').getTime(),
  totalQuoteTradeQuantity: '0.00000000',
  orderListId: -1,
  quoteOrderQuantity: '0.00000000',
  lastQuoteTransacted: '0.00000000',
  ...report,
});

export const mockCommonLimitNewSellOrder = (report?: Partial<ExecutionReport>): ExecutionReport => ({
  eventType: <ExecutionReport['eventType']>'executionReport',
  eventTime: 1582552800000,
  symbol: 'BTCUSDT',
  newClientOrderId: 'web_4a64263cfd544a6c8ed40856dc9fee04',
  originalClientOrderId: '',
  side: <OrderSide_LT>'SELL',
  orderType: <FuturesOrderType_LT>'LIMIT',
  timeInForce: <TimeInForce_LT>'GTC',
  quantity: '1.00000000',
  price: '9800.00000000',
  executionType: <ExecutionType_LT>'NEW',
  stopPrice: '0.00000000',
  icebergQuantity: '0.00000000',
  orderStatus: <OrderStatus_LT>'NEW',
  orderRejectReason: <OrderRejectReason>'NONE',
  orderId: 7510602300,
  orderTime: new Date('2020-02-24T15:00:00').getTime(),
  lastTradeQuantity: '0.00000000',
  totalTradeQuantity: '0.00000000',
  priceLastTrade: '0.00000000',
  commission: '0',
  commissionAsset: null,
  tradeId: -1,
  isOrderWorking: true,
  isBuyerMaker: false,
  creationTime: new Date('2020-02-24T15:00:00').getTime(),
  totalQuoteTradeQuantity: '0.00000000',
  orderListId: -1,
  quoteOrderQuantity: '0.00000000',
  lastQuoteTransacted: '0.00000000',
  ...report,
});

export const mockCommonLimitFilledSellOrder = (report?: Partial<ExecutionReport>): ExecutionReport => ({
  eventType: <ExecutionReport['eventType']>'executionReport',
  eventTime: 1582556400000,
  symbol: 'BTCUSDT',
  newClientOrderId: 'web_4a64263cfd544a6c8ed40856dc9fee04',
  originalClientOrderId: '',
  side: <OrderSide_LT>'SELL',
  orderType: <FuturesOrderType_LT>'LIMIT',
  timeInForce: <TimeInForce_LT>'GTC',
  quantity: '1.00000000',
  price: '9800.00000000',
  executionType: <ExecutionType_LT>'TRADE',
  stopPrice: '0.00000000',
  icebergQuantity: '0.00000000',
  orderStatus: <OrderStatus_LT>'FILLED',
  orderRejectReason: <OrderRejectReason>'NONE',
  orderId: 7510602300,
  orderTime: new Date('2020-02-24T16:00:00').getTime(),
  lastTradeQuantity: '1.00000000',
  totalTradeQuantity: '0.00000000',
  priceLastTrade: '0.00000000',
  commission: '9.80000000',
  commissionAsset: 'USDT',
  tradeId: -1,
  isOrderWorking: true,
  isBuyerMaker: false,
  creationTime: new Date('2020-02-24T15:00:00').getTime(),
  totalQuoteTradeQuantity: '0.00000000',
  orderListId: -1,
  quoteOrderQuantity: '0.00000000',
  lastQuoteTransacted: '0.00000000',
  ...report,
});
