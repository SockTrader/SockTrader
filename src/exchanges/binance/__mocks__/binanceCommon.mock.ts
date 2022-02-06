import { Order, OrderSide, OrderStatus, OrderType, TimeInForce } from 'binance-api-node'

export const mockCommonMarketBuyOrderResponse: Order = {
  symbol: 'BTCUSDT',
  orderId: 9286918563,
  orderListId: -1, //Unless OCO, value will be -1
  clientOrderId: 'C5Y3nTK24OQpnbwNYXhMUO',
  transactTime: 1582542000000,
  price: '0.00000000',
  origQty: '1.00000000',
  executedQty: '1.00000000',
  cummulativeQuoteQty: '1.00000000',
  isWorking: true,
  updateTime: 1582542000000,
  time: 1582542000000,
  status: <OrderStatus>'FILLED',
  timeInForce: <TimeInForce>'GTC',
  type: <OrderType>'MARKET',
  side: <OrderSide>'BUY',
  fills: [
    {
      tradeId: 1,
      price: '9800.00000000',
      qty: '1.00000000',
      commission: '9.80000000',
      commissionAsset: 'USDT'
    }
  ]
}

// @TODO change values of mock
// Create market buy order
//export const mockCommonMarketBuy: ExecutionReport = {
//  eventType: <EventType.EXECUTION_REPORT>'executionReport',
//  eventTime: 1631473349358,
//  symbol: 'BTCUSDT',
//  newClientOrderId: 'web_4a64263cfd544a6c8ed40856dc9fee04',
//  originalClientOrderId: '',
//  side: <OrderSide>'BUY',
//  orderType: <OrderType>'MARKET',
//  timeInForce: <TimeInForce>'GTC',
//  quantity: '0.00312000',
//  price: '32000.00000000',
//  executionType: <ExecutionType>'TRADE',
//  stopPrice: '0.00000000',
//  icebergQuantity: '0.00000000',
//  orderStatus: <OrderStatus>'FILLED',
//  orderRejectReason: <OrderRejectReason>'NONE',
//  orderId: 7510602383,
//  orderTime: 1631473349358,
//  lastTradeQuantity: '0.00000000',
//  totalTradeQuantity: '0.00000000',
//  priceLastTrade: '0.00000000',
//  commission: '0',
//  commissionAsset: null,
//  tradeId: -1,
//  isOrderWorking: true,
//  isBuyerMaker: false,
//  creationTime: 1582542000000,
//  totalQuoteTradeQuantity: '0.00000000',
//  orderListId: -1,
//  quoteOrderQuantity: '0.00000000',
//  lastQuoteTransacted: '0.00000000',
//};
