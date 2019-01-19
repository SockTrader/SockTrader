import {EventEmitter} from "events";
import CandleCollection, {ICandle, ICandleInterval} from "../candleCollection";
import Orderbook from "../orderbook";
import {IOrder, OrderSide} from "../orderInterface";
import {Pair} from "../types/pair";
import {IOrderbookData, ITradeablePair} from "./baseExchange";

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
     * Connects to the exchange with given connection properties
     * @param {string} connectionString web socket url to connect to
     */
    connect(connectionString?: string): void;

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
     * Fires when exchange is created
     */
    onCreate(): void;

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
     * @param {Extract<K extends keyof CandleCollection, "set" | "update">} method whether to update or overwrite
     */
    onUpdateCandles<K extends keyof CandleCollection>(pair: Pair, candles: ICandle[], interval: ICandleInterval, method: Extract<K, "set" | "update">): void;

    /**
     * Updates local order collection with collection from exchange
     * @param {IOrderbookData} orderBook the orders
     * @param {Extract<K extends keyof Orderbook, "setOrders" | "addIncrement">} method whether to update or overwrite
     */
    onUpdateOrderbook<K extends keyof Orderbook>(orderBook: IOrderbookData, method: Extract<K, "setOrders" | "addIncrement">): void;

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
