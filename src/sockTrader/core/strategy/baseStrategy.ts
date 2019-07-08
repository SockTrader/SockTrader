import {EventEmitter} from "events";
import CandleCollection from "../candles/candleCollection";
import {ICandle} from "../candles/candleManager";
import {IExchange} from "../exchanges/exchangeInterface";
import {IOrderbook} from "../orderbook";
import {IOrder, OrderSide} from "../types/order";
import {Pair} from "../types/pair";

export type IStrategyClass<T> = new(pair: Pair, exchange: IExchange) => T;

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

    constructor(readonly pair: Pair, readonly exchange: IExchange) {
        super();
    }

    /**
     * The strategy will be notified when the state of an order changes.
     * @param {IOrder} order – the new state of the order
     */
    abstract notifyOrder(order: IOrder): void;

    /**
     * Called on orderbook update coming from the exchange
     * @param {IOrderbook} orderBook – the new state of the orderbook
     */
    abstract updateOrderbook(orderBook: IOrderbook): void;

    /**
     * Called on each new candle coming from the exchange
     * @param {CandleCollection} candles – raw exchange candles wrapped in a CandleCollection
     */
    protected abstract updateCandles(candles: CandleCollection): void;

    /**
     * Receives the candles coming from the exchange. It wraps the candles in a CandleCollection
     * so that the resulting strategy has some extra utility methods to manipulate the candles.
     * @param candles – candles coming from the remote exchange
     */
    _onUpdateCandles(candles: ICandle[]): void {
        this.updateCandles(new CandleCollection(...candles));
    }

    /**
     * Receives the "warm-up" candles coming from the exchange. It wraps the candles in a CandleCollection
     * so that the resulting strategy has some extra utility methods to manipulate the candles.
     * @param candles – candles coming from the remote exchange
     */
    _onSnapshotCandles(candles: ICandle[]): void {
        this.warmUpCandles(new CandleCollection(...candles));
    }

    /**
     * Optional hook that a strategy can override to do something with the warm-up candles.
     * Note: its not guaranteed that this hook will be triggered on all exchanges.
     */
    protected warmUpCandles(candleCollection: CandleCollection) {
        // Optional hook
    }

    /**
     * Adjusts an existing order. Either price or quantity can be different.
     * @param {IOrder} order – the order that you would like to manipulate
     * @param {number} price – the new price of the order
     * @param {number} qty – the new quantity of the order
     */
    protected adjust(order: IOrder, price: number, qty: number): void {
        this.emit("core.adjustOrder", {order, price, qty} as IAdjustSignal);
    }

    /**
     * Sends a buy/sell signal to the exchange
     */
    protected signal(symbol: Pair, price: number, qty: number, side: OrderSide) {
        this.emit("core.signal", {symbol, price, qty, side} as ISignal);
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
