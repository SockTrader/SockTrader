import {Decimal} from "decimal.js-light";
import {EventEmitter} from "events";
import CandleManager from "../candles/candleManager";
import Orderbook from "../orderbook";
import {Candle} from "../types/Candle";
import {CandleInterval} from "../types/CandleInterval";
import {Connection} from "../types/Connection";
import {CurrencyMap} from "../types/CurrencyMap";
import {Exchange} from "../types/Exchange";
import {Order, OrderSide} from "../types/order";
import {OrderbookData} from "../types/OrderbookData";
import {OrderCreator} from "../types/OrderCreator";
import {OrderFiller} from "../types/OrderFiller";
import {Pair} from "../types/pair";
import {TradeablePair} from "../types/TradeablePair";

/**
 * The BaseExchange resembles common marketplace functionality
 */
export default abstract class BaseExchange extends EventEmitter implements Exchange {
    currencies: CurrencyMap = {};
    isAuthenticated = false;
    isCurrenciesLoaded = false;
    protected orderCreator!: OrderCreator;
    protected orderFiller!: OrderFiller;
    protected candles: Record<string, CandleManager> = {};
    protected readonly connection: Connection;
    private readonly orderbooks: Record<string, Orderbook> = {};
    private ready = false;

    constructor() {
        super();

        this.connection = this.createConnection();
    }

    abstract onUpdateOrderbook(data: OrderbookData): void;

    abstract subscribeCandles(pair: Pair, interval: CandleInterval): void;

    abstract subscribeOrderbook(pair: Pair): void;

    abstract subscribeReports(): void;

    protected abstract createConnection(): Connection;

    /**
     * Load trading pair configuration
     */
    protected abstract loadCurrencies(): void;

    setOrderCreator(orderCreator: OrderCreator) {
        this.orderCreator = orderCreator;
    }

    setCandleProcessor(orderFiller: OrderFiller) {
        this.orderFiller = orderFiller;
    }

    adjustOrder(order: Order, price: number, qty: number) {
        return this.orderCreator.adjustOrder(order, price, qty);
    }

    cancelOrder(order: Order) {
        return this.orderCreator.cancelOrder(order);
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide) {
        return this.orderCreator.createOrder(pair, price, qty, side);
    }

    onSnapshotCandles(pair: Pair, data: Candle[], interval: CandleInterval) {
        return this.orderFiller.onSnapshotCandles(pair, data, interval);
    }

    onUpdateCandles(pair: Pair, data: Candle[], interval: CandleInterval) {
        return this.orderFiller.onUpdateCandles(pair, data, interval);
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

    onCurrenciesLoaded(currencies: TradeablePair[]): void {
        currencies.forEach(currency => this.currencies[currency.id.join("")] = currency);
        this.isCurrenciesLoaded = true;
        this.isReady();
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
