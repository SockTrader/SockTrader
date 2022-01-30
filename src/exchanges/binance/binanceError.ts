import { OrderCommand } from '../../core/order.interfaces';

export default class BinanceError implements Error {

  message: string;

  name: string = 'Binance Error';

  errorMap = new Map([
    ['PERCENT_PRICE', (order: OrderCommand) => `[PERCENT_PRICE] The price must be within its boundaries see: multiplierDown * currentPrice < ${order.price} < multiplierUp * currentPrice \nFor more information try calling exchange.info('${order.symbol}')`],
    ['MIN_NOTIONAL', (order: OrderCommand) => `[MIN_NOTIONAL] The total price must meet a minimum see ${order.quantity} * ${order.price} >= minNotional\nFor more information try calling exchange.info('${order.symbol}')`]
  ]);

  constructor(
    private _error: unknown,
    private _orderCommand: OrderCommand
  ) {
    if (this._error instanceof Error) {
      const gen = this.errorMap.get(this.getErrorKey(this._error.message));
      this.message = gen ? gen(this._orderCommand) : `Unknown error encountered: ${this._error.stack}`;
    } else {
      this.message = `Unknown error encountered: ${this._error}`;
    }
  }

  getErrorKey(msg: string): string {
    const errorKeys = Array.from(this.errorMap.keys());
    return errorKeys.find(key => msg.includes(key)) ?? '';
  }

}
