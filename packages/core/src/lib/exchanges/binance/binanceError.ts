import { OrderCommand } from '../../interfaces';

export class BinanceError implements Error {
  message: string;

  name = 'Binance Error';

  errorMap = new Map([
    [
      'PERCENT_PRICE',
      (order: OrderCommand) =>
        `The price must be within its boundaries see: multiplierDown * currentPrice < ${order.price} < multiplierUp * currentPrice`,
    ],
    [
      'MIN_NOTIONAL',
      (order: OrderCommand) =>
        `The total price must meet a minimum see ${order.quantity} * ${order.price} >= minNotional`,
    ],
    [
      'LOT_SIZE',
      (order: OrderCommand) =>
        `Quantity '${order.quantity}' must be within its boundaries and should be a multiple of stepSize.`,
    ],
  ]);

  constructor(private _error: unknown, private _orderCommand: OrderCommand) {
    this.message =
      this._error instanceof Error
        ? this.createErrorMsg(this._error)
        : `Error encountered: ${this._error}`;
  }

  moreInfo = (order: OrderCommand) =>
    `\nFor more information try calling exchange.getSymbol('${order.symbol}')`;

  createErrorMsg(error: Error) {
    const key = this.getErrorKey(error.message);
    const gen = this.errorMap.get(key);

    return gen
      ? `[${key}] ${gen(this._orderCommand)} ${this.moreInfo(
          this._orderCommand
        )}`
      : `Error encountered: ${error.stack}`;
  }

  getErrorKey(msg: string): string {
    const errorKeys = Array.from(this.errorMap.keys());
    return errorKeys.find((key) => msg.includes(key)) ?? '';
  }
}
