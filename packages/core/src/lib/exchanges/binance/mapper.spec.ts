import { OrderSide, OrderType } from '../../interfaces';
import { mockCommonMarketBuyOrderResponse } from './__mocks__/binanceCommon.mock';
import { mapOrderCommand, mapOrderResponse } from './mapper';

describe('Mapper', () => {
  const order = {
    side: OrderSide.BUY,
    type: OrderType.MARKET,
    symbol: 'BTCUSDT',
    quantity: 0.002411,
  };

  it('should not contain price when mapping a market OrderCommand', () => {
    expect(mapOrderCommand(order)).toEqual({
      quantity: '0.002411',
      newOrderRespType: 'FULL',
      symbol: 'BTCUSDT',
      type: 'MARKET',
      side: 'BUY',
    });
  });

  it('should calculate average executed price for market order', () => {
    expect(mapOrderResponse(mockCommonMarketBuyOrderResponse)).toEqual(
      expect.objectContaining({
        order: expect.objectContaining({
          price: 9800,
          quantity: 1,
          side: 'BUY',
          status: 'FILLED',
          symbol: 'BTCUSDT',
          type: 'MARKET',
        }),
      })
    );
  });
});
