import {Decimal} from "decimal.js-light";
import {EventEmitter} from "events";
import {lowercase, numbers, uppercase} from "nanoid-dictionary";
import generate from "nanoid/generate";
import {client as WebSocketClient, connection, IMessage} from "websocket";
import {Pair} from "../../types/pair";
import CandleCollection, {ICandle, ICandleInterval} from "../candleCollection";
import logger from "../logger";
import Orderbook, {IOrderbookEntry} from "../orderbook";
import {IOrder, OrderSide, OrderStatus, ReportType} from "../orderInterface";
import {IExchange} from "./exchangeInterface";

export interface IResponseMapper {
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

export default abstract class BaseExchange extends EventEmitter implements IExchange {
    currencies: ICurrencyMap = {};
    isAuthenticated = false;
    isCurrenciesLoaded = false;
    protected candles: { [key: string]: CandleCollection } = {};
    protected openOrders: IOrder[] = [];
    protected socketClient: WebSocketClient = new WebSocketClient();
    private connection?: connection;
    private orderbooks: { [key: string]: Orderbook } = {};
    private orderIncrement = 0;
    private orderInProgress: { [key: string]: boolean } = {};
    private ready = false;

    protected constructor() {
        super();

        this.onCreate();
    }

    abstract adjustOrder(order: IOrder, price: number, qty: number): void;

    buy(pair: Pair, price: number, qty: number): string {
        return this.createOrder(pair, price, qty, OrderSide.BUY);
    }

    abstract cancelOrder(order: IOrder): void;

    connect(connectionString: string): void {
        this.socketClient.on("connectFailed", error => logger.error("Connect Error: " + error.toString()));
        this.socketClient.on("connect", (conn: connection) => this.onConnect(conn));

        this.socketClient.connect(connectionString);
    }

    /**
     * Send order base function
     */
    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): string {
        const orderId = this.generateOrderId(pair);
        this.setOrderInProgress(orderId);
        return orderId;
    }

    destroy(): void {
        this.removeAllListeners();
    }

    emit(event: string | symbol, ...args: any[]): boolean {
        const result = super.emit(event, ...args);
        if (!result && process.env.NODE_ENV === "dev") {
            logger.debug(`No listener found for: "${event.toString()}"`);
        }

        return result;
    }

    /**
     * Generates orderId based on trading pair, timestamp, increment and random string. With max length 32 characters
     * ex: 15COVETH1531299734778DkXBry9y-sQ
     * @param pair
     * @returns {string}
     */
    generateOrderId(pair: Pair): string {
        this.orderIncrement += 1;

        const alphabet = `${lowercase}${uppercase}${numbers}_-.|`;
        const orderId = `${this.orderIncrement}${pair}${new Date().getTime()}`;

        return orderId + generate(alphabet, 32 - orderId.length);
    }

    /**
     * Factory function which will manage the candles
     */
    getCandleCollection(pair: Pair, interval: ICandleInterval, updateHandler: (candles: CandleCollection) => void): CandleCollection {
        const key = `${pair}_${interval.code}`;
        if (this.candles[key]) {
            return this.candles[key];
        }

        this.candles[key] = new CandleCollection(interval);
        this.candles[key].on("update", updateHandler);
        return this.candles[key];
    }

    /**
     * Returns all open orders
     */
    getOpenOrders = (): IOrder[] => this.openOrders;

    /**
     * Factory function which will manage the orderbooks
     * @param pair
     * @returns {Orderbook}
     */
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
     */
    isReady(): boolean {
        if (this.ready) {
            return this.ready;
        }

        if (this.isCurrenciesLoaded && this.isAuthenticated) {
            this.ready = true;
            this.emit("ready");
        }

        return this.ready;
    }

    on(event: string, listener: (...args: any[]) => void): this {
        if (process.env.NODE_ENV === "dev") {
            logger.debug(`Listener created for: "${event.toString()}"`);
        }
        return super.on(event, listener);
    }

    /**
     * Exchange created event. Bootstrap the exchange asynchronously
     */
    onCreate(): void {
        setInterval(() => {
            this.orderIncrement = 0;
        }, 1000 * 60 * 5); // Reset increment every 5 minutes
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

        this.emit("app.report", order, oldOrder);
    }

    abstract onUpdateCandles<K extends keyof CandleCollection>(pair: Pair, data: ICandle[], interval: ICandleInterval, method: Extract<K, "set" | "update">): void;

    abstract onUpdateOrderbook<K extends keyof Orderbook>(data: IOrderbookData, method: Extract<K, "setOrders" | "addIncrement">): void;

    sell(pair: Pair, price: number, qty: number): string {
        return this.createOrder(pair, price, qty, OrderSide.SELL);
    }

    /**
     * Send request over socket connection
     */
    send(method: string, params: object = {}): void {
        const command = {method, params, id: method};
        if (this.connection === undefined) {
            throw new Error("First connect to the exchange before sending instructions..");
        }

        this.connection.send(JSON.stringify(command));
    }

    /**
     * Listen for new candles
     */
    abstract subscribeCandles(pair: Pair, interval: ICandleInterval): void;

    /**
     * Listen for orderbook changes
     */
    abstract subscribeOrderbook(pair: Pair): void;

    /**
     * Listen for actions that are happening on the remote exchange
     */
    abstract subscribeReports(): void;

    /**
     * Add order to internal array
     */
    protected addOrder(order: IOrder): void {
        this.openOrders.push(order);
    }

    /**
     * Validates if adjusting an existing order on an exchange is allowed
     * @param order
     * @param price
     * @param qty
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
     */
    protected onConnect(conn: connection): void {
        this.connection = conn;
        this.connection.on("error", error => logger.error("Connection Error: " + error.toString()));
        this.connection.on("close", () => logger.info("Connection Closed"));
    }

    /**
     * Remove order from internal array
     */
    protected removeOrder(orderId: string): void {
        this.openOrders = this.openOrders.filter(o => o.id !== orderId);
    }

    /**
     * Switch to set the state of an order
     */
    protected setOrderInProgress(orderId: string, state = true): void {
        if (state === false) {
            delete this.orderInProgress[orderId];
        } else {
            this.orderInProgress[orderId] = state;
        }
    }
}
