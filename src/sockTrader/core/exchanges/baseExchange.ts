import {Decimal} from "decimal.js-light";
import {EventEmitter} from "events";
import CandleManager from "../candles/candleManager";
import logger from "../logger";
import Orderbook from "../orderbook";
import {ICandle} from "../types/ICandle";
import {ICandleInterval} from "../types/ICandleInterval";
import {ICommand, IConnection} from "../types/IConnection";
import {ICurrencyMap} from "../types/ICurrencyMap";
import {IExchange} from "../types/IExchange";
import {IOrderbookData} from "../types/IOrderbookData";
import {ITradeablePair} from "../types/ITradeablePair";
import {IOrder, OrderSide, OrderStatus, ReportType} from "../types/order";
import {Pair} from "../types/pair";
import OrderManager from "./utils/orderManager";

/**
 * The BaseExchange resembles common marketplace functionality
 */
export default abstract class BaseExchange extends EventEmitter implements IExchange {
    currencies: ICurrencyMap = {};
    isAuthenticated = false;
    isCurrenciesLoaded = false;
    orderManager: OrderManager = new OrderManager();
    protected candles: Record<string, CandleManager> = {};
    private readonly orderbooks: Record<string, Orderbook> = {};
    private readonly connection: IConnection;
    private ready = false;

    constructor() {
        super();

        this.connection = this.createConnection();
    }

    abstract adjustOrder(order: IOrder, price: number, qty: number): void;

    abstract cancelOrder(order: IOrder): void;

    abstract createOrder(pair: Pair, price: number, qty: number, side: OrderSide): void;

    abstract onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void;

    abstract onUpdateOrderbook(data: IOrderbookData): void;

    abstract subscribeCandles(pair: Pair, interval: ICandleInterval): void;

    abstract subscribeOrderbook(pair: Pair): void;

    abstract subscribeReports(): void;

    protected abstract createConnection(): IConnection;

    /**
     * Load trading pair configuration
     */
    protected abstract loadCurrencies(): void;

    buy(pair: Pair, price: number, qty: number): void {
        this.createOrder(pair, price, qty, OrderSide.BUY);
    }

    connect(): void {
        this.connection.once("open", () => {
            this.onConnect();
            this.connection.on("open", () => this.onReconnect());
        });
        this.connection.connect();
    }

    destroy(): void {
        this.removeAllListeners();
        this.connection.removeAllListeners();
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

    getOrderbook(pair: Pair): Orderbook {
        const ticker = pair.join("");
        if (this.orderbooks[ticker]) {
            return this.orderbooks[ticker];
        }

        const config = this.currencies[ticker];
        if (!config) throw new Error(`No configuration found for pair: "${ticker}"`);

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

        this.orderManager.removeOrderProcessing(orderId);

        if (order.reportType === ReportType.REPLACED && order.originalId) {
            oldOrder = this.orderManager.findAndReplaceOpenOrder(order, order.originalId);
        } else if (order.reportType === ReportType.NEW) {
            this.orderManager.addOpenOrder(order); // New order created
        } else if (order.reportType === ReportType.TRADE && order.status === OrderStatus.FILLED) {
            this.orderManager.removeOpenOrder(orderId); // Order is 100% filled
        } else if ([ReportType.CANCELED, ReportType.EXPIRED, ReportType.SUSPENDED].indexOf(order.reportType) > -1) {
            this.orderManager.removeOpenOrder(orderId); // Order is invalid
        }

        this.emit("core.report", order, oldOrder);
    }

    getConnection(): IConnection {
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
     * Validates if adjusting an existing order on an exchange is allowed
     * @param order the order to check
     * @param price new price
     * @param qty new quantity
     */
    protected isAdjustingAllowed(order: IOrder, price: number, qty: number): boolean {
        if (this.orderManager.isOrderProcessing(order.id)) {
            return false; // Order still in progress
        }

        if (order.price === price && order.quantity === qty) {
            return false; // Old order === new order. No need to replace!
        }

        this.orderManager.setOrderProcessing(order.id);
        return true;
    }

    /**
     * Triggers each time the exchange is reconnected to the websocket API
     */
    protected onReconnect(): void {
        // lifecycle event
    }

    /**
     * Triggers the first time the exchange is connected to the websocket API
     */
    protected onConnect(): void {
        // lifecycle event
    }
}
