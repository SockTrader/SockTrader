import {EventEmitter} from "events";
import CandleCollection from "../candle/candleCollection";
import Orderbook from "../orderbook/orderbook";
import {Candle} from "../types/candle";
import {Exchange} from "../types/exchange";
import {Order, OrderSide} from "../types/order";
import {Pair} from "../types/pair";

export type IStrategyClass<T> = new(pair: Pair, exchange: Exchange) => T;

export interface Signal {
    price: number;
    qty: number;
    side: OrderSide;
    symbol: Pair;
}

export interface AdjustSignal {
    order: Order;
    price: number;
    qty: number;
}

/**
 * The BaseStrategy holds common logic for your strategies to use
 */
export default abstract class BaseStrategy extends EventEmitter {

    constructor(readonly pair: Pair, readonly exchange: Exchange) {
        super();
    }

    /**
     * The strategy will be notified when the state of an order changes.
     * @param {Order} order – the new state of the order
     */
    abstract notifyOrder(order: Order): void;

    /**
     * Called on orderbook update coming from the exchange
     * @param {Orderbook} orderBook – the new state of the orderbook
     */
    abstract updateOrderbook(orderBook: Orderbook): void;

    /**
     * Called on each new candle coming from the exchange
     * @param {CandleCollection} candles – raw exchange candles wrapped in a CandleCollection
     * @param pair
     */
    protected abstract updateCandle(candles: CandleCollection, pair: Pair): void;

    /**
     * Receives the candles coming from the exchange. It wraps the candles in a CandleCollection
     * so that the resulting strategy has some extra utility methods to manipulate the candles.
     * @param candles – candles coming from the remote exchange
     * @param pair
     */
    _onUpdateCandles(candles: Candle[], pair: Pair): void {
        this.updateCandle(new CandleCollection(candles), pair);
    }

    /**
     * Receives the "warm-up" candles coming from the exchange. It wraps the candles in a CandleCollection
     * so that the resulting strategy has some extra utility methods to manipulate the candles.
     * @param candles – candles coming from the remote exchange
     * @param pair
     */
    _onSnapshotCandles(candles: Candle[], pair: Pair): void {
        this.warmUpCandles(new CandleCollection(candles), pair);
    }

    /**
     * Optional hook that a strategy can override to do something with the warm-up candles.
     * Note: its not guaranteed that this hook will be triggered on all exchanges.
     */
    protected warmUpCandles(candleCollection: CandleCollection, pair: Pair) {
        // Optional hook
    }

    /**
     * Adjusts an existing order. Either price or quantity can be different.
     * @param {Order} order – the order that you would like to manipulate
     * @param {number} price – the new price of the order
     * @param {number} qty – the new quantity of the order
     */
    protected adjust(order: Order, price: number, qty: number): void {
        this.emit("core.adjustOrder", {order, price, qty} as AdjustSignal);
    }

    /**
     * Sends a buy/sell signal to the exchange
     */
    protected signal(symbol: Pair, price: number, qty: number, side: OrderSide) {
        this.emit("core.signal", {symbol, price, qty, side} as Signal);
    }

    /**
     * Shortcut method to send a buy signal
     */
    protected buy(pair: Pair, price: number, qty: number): void {
        this.signal(pair, price, qty, OrderSide.BUY);
    }

    /**
     * Shortcut method to send a sell signal
     */
    protected sell(pair: Pair, price: number, qty: number): void {
        this.signal(pair, price, qty, OrderSide.SELL);
    }
}
