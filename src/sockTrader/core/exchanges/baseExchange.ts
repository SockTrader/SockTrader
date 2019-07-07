import {Decimal} from "decimal.js-light";
import {EventEmitter} from "events";
import {lowercase, numbers, uppercase} from "nanoid-dictionary";
import generate from "nanoid/generate";
import {client as WebSocketClient, connection, IMessage} from "websocket";
import CandleManager, {ICandle, ICandleInterval} from "../candles/candleManager";
import logger from "../logger";
import Orderbook, {IOrderbookEntry} from "../orderbook";
import {IOrder, OrderSide, OrderStatus, ReportType} from "../types/order";
import {Pair} from "../types/pair";
import {IExchange} from "./exchangeInterface";

export interface IResponseAdapter {
    onReceive(msg: IMessage): void;
}

export interface ICurrencyMap {
    [key: string]: ITradeablePair;
}

export interface ITradeablePair {
    id: Pair;
    quantityIncrement: number;
    tickSize: number;
}

export interface IOrderbookData {
    ask: IOrderbookEntry[];
    bid: IOrderbookEntry[];
    pair: Pair;
    sequence: number;
}

/**
 * The BaseExchange resembles common marketplace functionality
 */
export default abstract class BaseExchange extends EventEmitter implements IExchange {
    currencies: ICurrencyMap = {};
    isAuthenticated = false;
    isCurrenciesLoaded = false;
    protected candles: { [key: string]: CandleManager } = {};
    protected openOrders: IOrder[] = [];
    protected socketClient: WebSocketClient = new WebSocketClient();
    private connection?: connection;
    private readonly orderbooks: { [key: string]: Orderbook } = {};
    private readonly orderInProgress: { [key: string]: boolean } = {};
    private orderIncrement = 0;
    private ready = false;

    protected constructor() {
        super();

        this.onCreate();
    }

    abstract adjustOrder(order: IOrder, price: number, qty: number): void;

    buy(pair: Pair, price: number, qty: number): void {
        this.createOrder(pair, price, qty, OrderSide.BUY);
    }

    abstract cancelOrder(order: IOrder): void;

    connect(connectionString: string): void {
        this.socketClient.on("connectFailed", error => logger.error("Connect Error: " + error.toString()));
        this.socketClient.on("connect", (conn: connection) => this.onConnect(conn));

        this.socketClient.connect(connectionString);
    }

    abstract createOrder(pair: Pair, price: number, qty: number, side: OrderSide): void;

    destroy(): void {
        this.removeAllListeners();
    }

    /**
     * Wraps the emit and notifies if no listeners where found
     * @param {string | symbol} event to throw
     * @param args event arguments
     * @returns {boolean} if listeners where found
     */
    emit(event: string | symbol, ...args: any[]): boolean {
        const result = super.emit(event, ...args);
        // TODO create config for all debug statements only to be active in dev
        if (!result && process.env.NODE_ENV === "dev") {
            logger.debug(`No listener found for: "${event.toString()}"`);
        }

        return result;
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

    getOpenOrders = (): IOrder[] => this.openOrders;

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

    /**
     * Wrapper for the on method to log registration of listeners
     * @param {string} event the event to register to
     * @param {(...args: any[]) => void} listener the listeners to bind
     * @returns {this} exchange
     */
    on(event: string, listener: (...args: any[]) => void): this {
        // TODO create config for all debug statements only to be active in dev
        if (process.env.NODE_ENV === "dev") {
            logger.debug(`Listener created for: "${event.toString()}"`);
        }
        return super.on(event, listener);
    }

    onCreate(): void {
        // onCreate lifecycle event
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

    abstract onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void;

    abstract onUpdateOrderbook(data: IOrderbookData): void;

    sell(pair: Pair, price: number, qty: number): void {
        this.createOrder(pair, price, qty, OrderSide.SELL);
    }

    /**
     * Send request over socket connection
     * @param {string} method the type of send
     * @param {object} params the data
     */
    send(method: string, params: object = {}): void {
        const command = {method, params, id: method};
        if (this.connection === undefined) {
            throw new Error("First connect to the exchange before sending instructions..");
        }

        this.connection.send(JSON.stringify(command));
    }

    abstract subscribeCandles(pair: Pair, interval: ICandleInterval): void;

    abstract subscribeOrderbook(pair: Pair): void;

    /**
     * Listen for actions that are happening on the remote exchange
     */
    abstract subscribeReports(): void;

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
    protected isAdjustingOrderAllowed(order: IOrder, price: number, qty: number): boolean {
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
     * Load trading pair configuration
     */
    protected abstract loadCurrencies(): void;

    /**
     * Triggers when the exchange is connected to the websocket API
     * @param {connection} conn the connection
     */
    protected onConnect(conn: connection): void {
        this.connection = conn;
        this.connection.on("error", error => logger.error("Connection Error: " + error.toString()));
        this.connection.on("close", () => logger.info("Connection Closed"));
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
