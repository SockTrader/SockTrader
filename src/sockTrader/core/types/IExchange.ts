import {EventEmitter} from "events";
import Orderbook from "../orderbook";
import {ICandle} from "./ICandle";
import {ICandleInterval} from "./ICandleInterval";
import {IOrderbookData} from "./IOrderbookData";
import {ITradeablePair} from "./ITradeablePair";
import {IOrder, OrderSide} from "./order";
import {Pair} from "./pair";

/**
 * The IExchange represents a marketplace to buy and sell
 * cryptocurrencies
 */
export interface IExchange extends EventEmitter {

    isAuthenticated: boolean;
    isCurrenciesLoaded: boolean;

    /**
     * Adjusts existing order on exchange
     * @param order the order to adjust
     * @param price the new price
     * @param qty the new quantity
     */
    adjustOrder(order: IOrder, price: number, qty: number): void;

    /**
     * Signals a buy to the exchange
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     * @param {number} price at which to buy/sell
     * @param {number} qty quantity to buy/sell
     */
    buy(pair: Pair, price: number, qty: number): void;

    /**
     * Cancel existing order on exchange
     * @param {IOrder} order to cancel
     */
    cancelOrder(order: IOrder): void;

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
     * Gets all orders that have not yet been filled
     * @returns {IOrder[]}
     */
    getOpenOrders(): IOrder[];

    /**
     * Gets all (of everyone) open buy and sell order for a given pair on the
     * exchange
     * @param pair crypto pair (BTC USD/BTC ETH)
     * @returns {Orderbook} open buys and sells for pair
     */
    getOrderbook(pair: Pair): Orderbook;

    /**
     * Registers all tradeable currencies on exchange
     * @param {ITradeablePair[]} currencies
     */
    onCurrenciesLoaded(currencies: ITradeablePair[]): void;

    /**
     * Updates the local order when exchange sends updated information
     * @param {IOrder} order the order to update
     */
    onReport(order: IOrder): void;

    /**
     * Updates local candle collection with collection from exchange
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     * @param {ICandle[]} candles updated candles
     * @param {ICandleInterval} interval candle interval
     */
    onUpdateCandles(pair: Pair, candles: ICandle[], interval: ICandleInterval): void;

    /**
     * Updates local order collection with collection from exchange
     * @param {IOrderbookData} orderBook the orders
     */
    onUpdateOrderbook(orderBook: IOrderbookData): void;

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
     * @param {ICandleInterval} interval time interval
     */
    subscribeCandles(pair: Pair, interval: ICandleInterval): void;

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
