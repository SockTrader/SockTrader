import {EventEmitter} from "events";
import BaseExchange from "../exchanges/baseExchange";
import LocalExchange from "../exchanges/localExchange";
import {Candle} from "./candle";
import {CandleInterval} from "./candleInterval";
import {Order, OrderSide} from "./order";
import {OrderbookData} from "./orderbookData";
import {Pair} from "./pair";
import {TradeablePair} from "./tradeablePair";

export const isLocalExchange = (exchange: BaseExchange): exchange is LocalExchange => exchange instanceof LocalExchange;

/**
 * The IExchange represents a marketplace to buy and sell
 * cryptocurrencies
 */
export interface Exchange extends EventEmitter {

    /**
     * Adjusts existing order on exchange
     * @param order the order to adjust
     * @param price the new price
     * @param qty the new quantity
     */
    adjustOrder(order: Order, price: number, qty: number): void;

    /**
     * Signals a buy to the exchange
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     * @param {number} price at which to buy/sell
     * @param {number} qty quantity to buy/sell
     */
    buy(pair: Pair, price: number, qty: number): void;

    /**
     * Cancel existing order on exchange
     * @param {Order} order to cancel
     */
    cancelOrder(order: Order): void;

    /**
     * Connects to the remote exchange
     */
    connect(): void;

    /**
     * Places an order on the exchange
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     * @param {number} price at which to buy/sell
     * @param {number} qty quantity to buy/sell
     * @param {OrderSide} side buy or sell
     * @returns {string} order id
     */
    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): void;

    /**
     * Removes the exchanges from the running application
     * i.e. removes the event listeners
     */
    destroy(): void;

    /**
     * Registers all tradeable currencies on exchange
     * @param {TradeablePair[]} currencies
     */
    onCurrenciesLoaded(currencies: TradeablePair[]): void;

    /**
     * Updates local candle collection with collection from exchange
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     * @param {Candle[]} candles updated candles
     * @param {CandleInterval} interval candle interval
     */
    onUpdateCandles(pair: Pair, candles: Candle[], interval: CandleInterval): void;

    /**
     * Updates local order collection with collection from exchange
     * @param {OrderbookData} orderBook the orders
     */
    onUpdateOrderbook(orderBook: OrderbookData): void;

    /**
     * Sends a sell signal to the exchange
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     * @param {number} price at which to sell
     * @param {number} qty to buy
     */
    sell(pair: Pair, price: number, qty: number): void;

    /**
     * Registers to a candle collection for a given pair/interval
     * e.g. BTC/ETH every 5 minutes
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     * @param {CandleInterval} interval time interval
     */
    subscribeCandles(pair: Pair, interval: CandleInterval): void;

    /**
     * Registers to order book for given pair
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     */
    subscribeOrderbook(pair: Pair): void;

    /**
     * Registers to order updates
     */
    subscribeReports(): void;
}
