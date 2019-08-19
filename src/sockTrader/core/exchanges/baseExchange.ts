import {Decimal} from "decimal.js-light";
import {EventEmitter} from "events";
import CandleManager from "../candles/candleManager";
import Orderbook from "../orderbook";
import {ICandle} from "../types/ICandle";
import {ICandleInterval} from "../types/ICandleInterval";
import {IConnection} from "../types/IConnection";
import {ICurrencyMap} from "../types/ICurrencyMap";
import {IExchange} from "../types/IExchange";
import {IOrderbookData} from "../types/IOrderbookData";
import {ITradeablePair} from "../types/ITradeablePair";
import {IOrder, OrderSide, OrderStatus, ReportType} from "../types/order";
import {OrderReportingBehaviour} from "../types/OrderReportingBehaviour";
import {Pair} from "../types/pair";
import BacktestReportingBehaviour from "./orderReporting/backtestReportingBehaviour";
import PaperTradingReportingBehaviour from "./orderReporting/paperTradingReportingBehaviour";
import OrderTracker from "./utils/orderTracker";

/**
 * The BaseExchange resembles common marketplace functionality
 */
export default abstract class BaseExchange extends EventEmitter implements IExchange {
    currencies: ICurrencyMap = {};
    isAuthenticated = false;
    isCurrenciesLoaded = false;
    orderTracker: OrderTracker = new OrderTracker();
    protected candles: Record<string, CandleManager> = {};
    protected orderReporter!: OrderReportingBehaviour;
    protected readonly connection: IConnection;
    private readonly orderbooks: Record<string, Orderbook> = {};
    private ready = false;

    constructor() {
        super();

        this.connection = this.createConnection();
        this.setOrderReportingBehaviour();
    }

    abstract onUpdateOrderbook(data: IOrderbookData): void;

    abstract subscribeCandles(pair: Pair, interval: ICandleInterval): void;

    abstract subscribeOrderbook(pair: Pair): void;

    abstract subscribeReports(): void;

    protected abstract createConnection(): IConnection;

    protected abstract getOrderReportingBehaviour(): OrderReportingBehaviour;

    adjustOrder(order: IOrder, price: number, qty: number) {
        return this.orderReporter.adjustOrder(order, price, qty);
    }

    cancelOrder(order: IOrder) {
        return this.orderReporter.cancelOrder(order);
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide) {
        return this.orderReporter.createOrder(pair, price, qty, side);
    }

    onSnapshotCandles(pair: Pair, data: ICandle[], interval: ICandleInterval) {
        return this.orderReporter.onSnapshotCandles(pair, data, interval);
    }

    onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval) {
        return this.orderReporter.onUpdateCandles(pair, data, interval);
    }

    /**
     * Load trading pair configuration
     */
    protected abstract loadCurrencies(): void;

    protected setOrderReportingBehaviour() {
        console.log(process.env.SOCKTRADER_TRADING_MODE);
        if (process.env.SOCKTRADER_TRADING_MODE === "BACKTEST") {
            this.orderReporter = new BacktestReportingBehaviour(this.orderTracker, this);
        }

        if (process.env.SOCKTRADER_TRADING_MODE === "PAPER") {
            this.orderReporter = new PaperTradingReportingBehaviour();
        }

        this.orderReporter = this.getOrderReportingBehaviour();
    }

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

        this.orderTracker.setOrderConfirmed(orderId);

        if (order.reportType === ReportType.REPLACED && order.originalId) {
            oldOrder = this.orderTracker.replaceOpenOrder(order, order.originalId);
        } else if (order.reportType === ReportType.NEW) {
            this.orderTracker.addOpenOrder(order); // New order created
        } else if (order.reportType === ReportType.TRADE && order.status === OrderStatus.FILLED) {
            this.orderTracker.removeOpenOrder(orderId); // Order is 100% filled
        } else if ([ReportType.CANCELED, ReportType.EXPIRED, ReportType.SUSPENDED].indexOf(order.reportType) > -1) {
            this.orderTracker.removeOpenOrder(orderId); // Order is invalid
        }

        this.emit("core.report", order, oldOrder);
    }

    sell(pair: Pair, price: number, qty: number): void {
        this.createOrder(pair, price, qty, OrderSide.SELL);
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
