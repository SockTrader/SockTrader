import { OrderCommand, OrderSide, OrderType } from '../../interfaces';
import { BinanceError } from './binanceError';

describe('BinanceError', () => {
  it("Should provide 'PERCENT_PRICE' error details with relevant data", () => {
    const orderCommand: OrderCommand = {
      symbol: 'BTCUSDT',
      side: OrderSide.BUY,
      type: OrderType.LIMIT,
      quantity: 0.001,
      price: 1000,
    };
    const error: Error = new Error('PERCENT_PRICE');
    const binanceError: BinanceError = new BinanceError(error, orderCommand);

    expect(binanceError.message).toEqual(
      '[PERCENT_PRICE] The price must be within its boundaries see: multiplierDown * currentPrice < 1000 < ' +
        "multiplierUp * currentPrice \nFor more information try calling exchange.getSymbol('BTCUSDT')"
    );
  });

  it("Should provide 'MIN_NOTIONAL' error details with relevant data", () => {
    const orderCommand: OrderCommand = {
      symbol: 'BTCUSDT',
      side: OrderSide.BUY,
      type: OrderType.LIMIT,
      quantity: 0.001,
      price: 1000,
    };
    const error: Error = new Error('MIN_NOTIONAL');
    const binanceError: BinanceError = new BinanceError(error, orderCommand);

    expect(binanceError.message).toEqual(
      '[MIN_NOTIONAL] The total price must meet a minimum see 0.001 * 1000 >= ' +
        "minNotional \nFor more information try calling exchange.getSymbol('BTCUSDT')"
    );
  });
});
