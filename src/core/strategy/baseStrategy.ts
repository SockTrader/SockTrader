import {EventEmitter} from "events";
import {ICandle} from "../candleCollection";
import {IExchange} from "../exchanges/exchangeInterface";
import {IOrderbook} from "../orderbook";
import {IOrder, OrderSide} from "../orderInterface";

export interface IStrategyClass<T> {
    new(pair: string, exchange: IExchange): T;
}

/**
 * @class BaseStrategy
 * @classdesc Reusable strategy class
 */
export default abstract class BaseStrategy extends EventEmitter {

    /**
     * Constructor
     * @param {string} pair
     * @param exchange
     */
    protected constructor(public pair: string, public exchange: IExchange) {
        super();
    }

    notifyOrder(data: IOrder): void {
        throw new Error("Implement method: notifyOrder");
    }

    updateCandles(candles: ICandle[]): void {
        throw new Error("Implement method: updateCandles");
    }

    updateOrderbook(orderBook: IOrderbook): void {
        throw new Error("Implement method: updateOrderbook");
    }

    protected adjust(order: IOrder, price: number, qty: number): void {
        this.emit("app.adjustOrder", {order, price, qty});
    }

    protected buy(symbol: string, price: number, qty: number): void {
        this.emit("app.signal", {symbol, price, qty, side: OrderSide.BUY});
    }

    protected sell(symbol: string, price: number, qty: number): void {
        this.emit("app.signal", {symbol, price, qty, side: OrderSide.SELL});
    }
}
