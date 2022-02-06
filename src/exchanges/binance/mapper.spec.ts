import { OrderSide, OrderType } from '../../core/order.interfaces';
import { mockCommonMarketBuyOrderResponse } from './__mocks__/binanceCommon.mock';
import { dca, mapOrderCommand, mapOrderResponse } from './mapper';

describe('Mapper', () => {

  const order = {
    side: OrderSide.BUY,
    type: OrderType.MARKET,
    symbol: 'BTCUSDT',
    quantity: 0.002411
  };

  it('should not contain price when mapping a market OrderCommand', () => {
    expect(mapOrderCommand(order)).toEqual({
      quantity: '0.00241100',
      symbol: 'BTCUSDT',
      type: 'MARKET',
      side: 'BUY',
    });
  });

  it('should calculate average executed price for market order', () => {
    expect(mapOrderResponse(mockCommonMarketBuyOrderResponse)).toEqual(expect.objectContaining({
      order: expect.objectContaining({
        price: 41638,
        quantity: 1,
        side: 'BUY',
        status: 'FILLED',
        symbol: 'BTCUSDT',
        type: 'MARKET',
      })
    }));
  });

  it('should calculate dollar cost average price', () => {
    expect(dca([
      { price: '200', qty: '1', commission: '', commissionAsset: 'USDT', tradeId: 1 },
      { price: '100', qty: '1', commission: '', commissionAsset: 'USDT', tradeId: 1 },
    ])).toEqual(150)
  })
});
