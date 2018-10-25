import {EventEmitter} from "events";
import {ICandle} from "./candleCollection";
import {IExchange} from "./exchanges/exchangeInterface";
import {IOrderbook} from "./orderbook";
import {IOrder, OrderSide} from "./orderInterface";

/**
 * @class Strategy
 * @classdesc Reusable strategy class
 */
export default abstract class Strategy extends EventEmitter {

    /**
     * Constructor
     * @param {string} pair
     * @param exchange
     */
    protected constructor(public pair: string, public exchange: IExchange) {
        super();
    }

    /**
     * Abstract notifyOrder method
     * @abstract
     */
    // @TODO fix any..
    public abstract notifyOrder(data: any): void;

    public abstract updateCandles(candles: ICandle[]): void;

    public abstract updateOrderbook(orderBook: IOrderbook): void;

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
