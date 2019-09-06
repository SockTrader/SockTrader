import {Decimal} from "decimal.js-light";
import {EventEmitter} from "events";
import config from "../../../config";
import Wallet from "../assets/wallet";
import CandleManager from "../candles/candleManager";
import Orderbook from "../orderbook";
import {CandleProcessor} from "../types/candleProcessor";
import {ICandle} from "../types/ICandle";
import {ICandleInterval} from "../types/ICandleInterval";
import {IConnection} from "../types/IConnection";
import {ICurrencyMap} from "../types/ICurrencyMap";
import {IExchange} from "../types/IExchange";
import {IOrderbookData} from "../types/IOrderbookData";
import {ITradeablePair} from "../types/ITradeablePair";
import {IOrder, OrderSide} from "../types/order";
import {OrderCreator} from "../types/orderCreator";
import {Pair} from "../types/pair";
import LocalOrderCreator from "./orderCreators/localOrderCreator";
import OrderTracker from "./utils/orderTracker";

/**
 * The BaseExchange resembles common marketplace functionality
 */
export default abstract class BaseExchange extends EventEmitter implements IExchange {
    currencies: ICurrencyMap = {};
    isAuthenticated = false;
    isCurrenciesLoaded = false;
    readonly orderTracker: OrderTracker = new OrderTracker();
    protected orderCreator!: OrderCreator;
    protected candleProcessor!: CandleProcessor;
    protected candles: Record<string, CandleManager> = {};
    protected readonly connection: IConnection;
    protected readonly wallet = new Wallet(config.assets);
    private readonly orderbooks: Record<string, Orderbook> = {};
    private ready = false;

    constructor() {
        super();

        this.connection = this.createConnection();
        this.setExchangeBehaviour();
    }

    abstract onUpdateOrderbook(data: IOrderbookData): void;

    abstract subscribeCandles(pair: Pair, interval: ICandleInterval): void;

    abstract subscribeOrderbook(pair: Pair): void;

    abstract subscribeReports(): void;

    protected abstract createConnection(): IConnection;

    protected abstract getCandleProcessor(): CandleProcessor;

    protected abstract getOrderCreator(): OrderCreator;

    /**
     * Load trading pair configuration
     */
    protected abstract loadCurrencies(): void;

    /**
     * Dynamically change the behaviour of the exchange.
     */
    protected setExchangeBehaviour() {
        const isLive = process.env.SOCKTRADER_TRADING_MODE === "LIVE";

        // Use LocalOrderCreator in case of: backtest & paper trading
        this.orderCreator = isLive ? this.getOrderCreator() : new LocalOrderCreator(this.orderTracker, this.wallet);
        this.candleProcessor = this.getCandleProcessor();
    }

    adjustOrder(order: IOrder, price: number, qty: number) {
        return this.orderCreator.adjustOrder(order, price, qty);
    }

    cancelOrder(order: IOrder) {
        return this.orderCreator.cancelOrder(order);
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide) {
        return this.orderCreator.createOrder(pair, price, qty, side);
    }

    onSnapshotCandles(pair: Pair, data: ICandle[], interval: ICandleInterval) {
        return this.candleProcessor.onSnapshotCandles(pair, data, interval);
    }

    onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval) {
        return this.candleProcessor.onUpdateCandles(pair, data, interval);
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

        const currency = this.currencies[ticker];
        if (!currency) throw new Error(`No configuration found for pair: "${ticker}"`);

        const precision = new Decimal(currency.tickSize).decimalPlaces();

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
        const {order: newOrder, oldOrder} = this.orderTracker.process(order);
        this.emit("core.report", newOrder, oldOrder);
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
