import {Decimal} from "decimal.js-light";
import {EventEmitter} from "events";
import {lowercase, numbers, uppercase} from "nanoid-dictionary";
import generate from "nanoid/generate";
import CandleManager from "../candles/candleManager";
import WebSocket from "../connection/webSocket";
import logger from "../logger";
import Orderbook from "../orderbook";
import {ICandle} from "../types/ICandle";
import {ICandleInterval} from "../types/ICandleInterval";
import {ICurrencyMap} from "../types/ICurrencyMap";
import {IExchange} from "../types/IExchange";
import {IOrderbookData} from "../types/IOrderbookData";
import {ITradeablePair} from "../types/ITradeablePair";
import {IOrder, OrderSide, OrderStatus, ReportType} from "../types/order";
import {Pair} from "../types/pair";

interface ICommand {
    method: string;
    params: object;
    id: string;
}

export interface IConfig {
    connectionString: string;
    timeout: number;
    auth: Record<string, string>;
}

/**
 * The BaseExchange resembles common marketplace functionality
 */
export default abstract class BaseExchange extends EventEmitter implements IExchange {
    currencies: ICurrencyMap = {};
    isAuthenticated = false;
    isCurrenciesLoaded = false;
    protected openOrders: IOrder[] = [];
    protected candles: Record<string, CandleManager> = {};
    private readonly orderbooks: Record<string, Orderbook> = {};
    private readonly orderInProgress: Record<string, boolean> = {};
    private readonly connection: WebSocket;
    private orderIncrement = 0;
    private ready = false;

    constructor() {
        super();

        const {connectionString, timeout} = this.getConfig();
        this.connection = new WebSocket(connectionString, timeout);
    }

    abstract adjustOrder(order: IOrder, price: number, qty: number): void;

    abstract cancelOrder(order: IOrder): void;

    abstract createOrder(pair: Pair, price: number, qty: number, side: OrderSide): void;

    abstract onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void;

    abstract onUpdateOrderbook(data: IOrderbookData): void;

    abstract subscribeCandles(pair: Pair, interval: ICandleInterval): void;

    abstract subscribeOrderbook(pair: Pair): void;

    abstract subscribeReports(): void;

    protected abstract getConfig(): IConfig;

    /**
     * Load trading pair configuration
     */
    protected abstract loadCurrencies(): void;

    buy(pair: Pair, price: number, qty: number): void {
        this.createOrder(pair, price, qty, OrderSide.BUY);
    }

    connect(): void {
        this.connection.on("open", () => this.onConnect());
        this.connection.once("open", () => this.onFirstConnect());
        this.connection.connect();
    }

    destroy(): void {
        this.removeAllListeners();
        this.connection.removeAllListeners();
    }

    /**
     * Generates orderId based on trading pair, timestamp, increment and random string. With max length 32 characters
     * ex: 15COVETH1531299734778DkXBry9y-sQ
     * @param pair crypto pair (BTC USD/BTC ETH)
     * @returns {string} order id
     */
    generateOrderId(pair: Pair): string {
        this.orderIncrement += 1;

        const alphabet = `${lowercase}${uppercase}${numbers}_-.|`;
        const orderId = `${this.orderIncrement}${pair}${new Date().getTime()}`;

        return orderId + generate(alphabet, 32 - orderId.length);
    }

    /**
     * Returns candle manager for pair and interval
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     * @param {ICandleInterval} interval time interval
     * @param {(candles: CandleManager) => void} updateHandler what to do if candle collection updates
     * @returns {CandleManager} the candle collection
     */
    getCandleManager(pair: Pair, interval: ICandleInterval, updateHandler: (candles: CandleManager) => void): CandleManager {
        const key = `${pair}_${interval.code}`;
        if (this.candles[key]) {
            return this.candles[key];
        }

        this.candles[key] = new CandleManager(interval);
        this.candles[key].on("update", updateHandler);
        return this.candles[key];
    }

    getOpenOrders(): IOrder[] {
        return this.openOrders;
    }

    getOrderbook(pair: Pair): Orderbook {
        const ticker = pair.join("");
        if (this.orderbooks[ticker]) {
            return this.orderbooks[ticker];
        }

        const config = this.currencies[ticker];
        if (!config) {
            throw new Error(`No configuration found for pair: "${ticker}"`);
        }

        const precision = new Decimal(config.tickSize).decimalPlaces();

        this.orderbooks[ticker] = new Orderbook(pair, precision);
        return this.orderbooks[ticker];
    }

    /**
     * Verify if the exchange is ready and trigger the "ready" event if ready.
     * Can be called multiple times.. it will trigger the "ready" event only once.
     * @returns {boolean}
     */
    isReady(): boolean {
        if (this.ready) return this.ready;

        if (this.isCurrenciesLoaded && this.isAuthenticated) {
            this.ready = true;
            this.emit("ready");
        }

        return this.ready;
    }

    onCurrenciesLoaded(currencies: ITradeablePair[]): void {
        currencies.forEach(currency => this.currencies[currency.id.join("")] = currency);
        this.isCurrenciesLoaded = true;
        this.isReady();
    }

    onReport(order: IOrder): void {
        const orderId = order.id;
        let oldOrder: IOrder | undefined;

        this.setOrderInProgress(orderId, false);

        if (order.reportType === ReportType.REPLACED && order.originalId) {
            const oldOrderId = order.originalId;

            oldOrder = this.openOrders.find(oo => oo.id === oldOrderId);
            this.setOrderInProgress(oldOrderId, false);
            this.removeOrder(oldOrderId);
            this.addOrder(order); // Order is replaced with a new one
        } else if (order.reportType === ReportType.NEW) {
            this.addOrder(order); // New order created
        } else if (order.reportType === ReportType.TRADE && order.status === OrderStatus.FILLED) {
            this.removeOrder(orderId); // Order is 100% filled
        } else if ([ReportType.CANCELED, ReportType.EXPIRED, ReportType.SUSPENDED].indexOf(order.reportType) > -1) {
            this.removeOrder(orderId); // Order is invalid
        }

        this.emit("core.report", order, oldOrder);
    }

    getConnection(): WebSocket {
        return this.connection;
    }

    sell(pair: Pair, price: number, qty: number): void {
        this.createOrder(pair, price, qty, OrderSide.SELL);
    }

    createCommand(method: string, params: object = {}): ICommand {
        return {method, params, id: method};
    }

    /**
     * The created command will be automatically restored if the exchange loses connection.
     * @param method
     * @param params
     */
    createRestorableCommand(method: string, params: object = {}): ICommand {
        const command = this.createCommand(method, params);

        this.getConnection().addRestorable(command);
        return command;
    }

    /**
     * Send request over socket connection
     * @param command
     */
    send(command: ICommand): void {
        try {
            this.connection.send(command);
        } catch (e) {
            logger.error(e);
        }
    }

    /**
     * Adds order to local array
     * @param {IOrder} order the order to add
     */
    protected addOrder(order: IOrder): void {
        this.openOrders.push(order);
    }

    /**
     * Validates if adjusting an existing order on an exchange is allowed
     * @param order the order to check
     * @param price new price
     * @param qty new quantity
     */
    protected isAdjustingAllowed(order: IOrder, price: number, qty: number): boolean {
        if (this.orderInProgress[order.id]) {
            return false; // Order still in progress
        }

        if (order.price === price && order.quantity === qty) {
            return false; // Old order === new order. No need to replace!
        }

        this.setOrderInProgress(order.id);
        return true;
    }

    /**
     * Triggers each time the exchange is reconnected to the websocket API
     */
    protected onConnect(): void {
        // lifecycle event
    }

    /**
     * Triggers the first time the exchange is connected to the websocket API
     */
    protected onFirstConnect(): void {
        // lifecycle event
    }

    /**
     * Remove order from local array
     * @param {string} orderId of the order to remove
     */
    protected removeOrder(orderId: string): void {
        this.openOrders = this.openOrders.filter(o => o.id !== orderId);
    }

    /**
     * Sets the order in progress
     * @param {string} orderId of the order to set in progress
     * @param {boolean} state whether the order should be set in progress or out
     */
    protected setOrderInProgress(orderId: string, state = true): void {
        if (!state) {
            delete this.orderInProgress[orderId];
        } else {
            this.orderInProgress[orderId] = state;
        }
    }
}
