import {EventEmitter} from "events";
import {Error} from "tslint/lib/error";
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
 * The BaseStrategy holds common logic for your strategies to use
 */
export default abstract class BaseStrategy extends EventEmitter {

    protected constructor(public pair: Pair, public exchange: IExchange) {
        super();
    }

    /**
     * Called when exchange confirms and order
     * @param {IOrder} order the order
     */
    notifyOrder(order: IOrder): void {
        throw new Error("Implement method: notifyOrder");
    }

    /**
     * Called on each new candle from exchange
     * @param {ICandle[]} candles the new candles
     */
    updateCandles(candles: ICandle[]): void {
        throw new Error("Implement method: updateCandles");
    }

    /**
     * Called on orderbook update from exchange
     * @param {IOrderbook} orderBook the new orderbook
     */
    updateOrderbook(orderBook: IOrderbook): void {
        throw new Error("Implement method: updateOrderbook");
    }

    /**
     * Fires a adjust existing order event to exchange
     * @param {IOrder} order the order to adjust
     * @param {number} price the new price
     * @param {number} qty the new quantity
     */
    protected adjust(order: IOrder, price: number, qty: number): void {
        this.emit("app.adjustOrder", {order, price, qty} as IAdjustSignal);
    }

    /**
     * Fires a buy event to exchange
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     * @param {number} price the price a which to buy
     * @param {number} qty the quantity to buy
     */
    protected buy(pair: Pair, price: number, qty: number): void {
        this.emit("app.signal", {symbol: pair, price, qty, side: OrderSide.BUY} as ISignal);
    }

    /**
     * Fires a sell event to exchange
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     * @param {number} price the price a which to sell
     * @param {number} qty the quantity to sell
     */
    protected sell(pair: Pair, price: number, qty: number): void {
        this.emit("app.signal", {symbol: pair, price, qty, side: OrderSide.SELL} as ISignal);
    }
}
