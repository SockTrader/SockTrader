import {EventEmitter} from "events";
import {Pair} from "../../types/pair";
import {ICandle} from "../candleCollection";
import {IExchange} from "../exchanges/exchangeInterface";
import {IOrderbook} from "../orderbook";
import {IOrder, OrderSide} from "../orderInterface";

export interface IStrategyClass<T> {
    new(pair: Pair, exchange: IExchange): T;
}

export interface ISignal {
    price: number;
    qty: number;
    side: OrderSide;
    symbol: Pair;
}

export interface IAdjustSignal {
    order: IOrder;
    price: number;
    qty: number;
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
    protected constructor(public pair: Pair, public exchange: IExchange) {
        super();
    }

    /**
     * Called when exchange confirms and order
     * @param {IOrder} order
     */
    notifyOrder(order: IOrder): void {
        throw new Error("Implement method: notifyOrder");
    }

    /**
     * Called on each new candle from exchange
     * @param {ICandle[]} candles
     */
    updateCandles(candles: ICandle[]): void {
        throw new Error("Implement method: updateCandles");
    }

    updateOrderbook(orderBook: IOrderbook): void {
        throw new Error("Implement method: updateOrderbook");
    }

    protected adjust(order: IOrder, price: number, qty: number): void {
        this.emit("app.adjustOrder", {order, price, qty} as IAdjustSignal);
    }

    protected buy(symbol: Pair, price: number, qty: number): void {
        this.emit("app.signal", {symbol, price, qty, side: OrderSide.BUY} as ISignal);
    }

    protected sell(symbol: Pair, price: number, qty: number): void {
        this.emit("app.signal", {symbol, price, qty, side: OrderSide.SELL} as ISignal);
    }
}
