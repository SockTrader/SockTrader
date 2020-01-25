import {EventEmitter} from "events";
import CandleManager from "../candle/candleManager";
import OrderTracker from "../order/orderTracker";
import {Candle} from "../types/candle";
import {CandleInterval} from "../types/candleInterval";
import {Connection} from "../types/connection";
import {CurrencyMap} from "../types/currencyMap";
import {Exchange} from "../types/exchange";
import {Order, OrderSide} from "../types/order";
import {OrderbookData} from "../types/orderbookData";
import {OrderCreator} from "../types/orderCreator";
import {OrderFiller} from "../types/orderFiller";
import {Pair} from "../types/pair";
import {TradeablePair} from "../types/tradeablePair";
import Wallet from "../wallet/wallet";

/**
 * The BaseExchange resembles common marketplace functionality
 */
export default abstract class BaseExchange extends EventEmitter implements Exchange {
    currencies: CurrencyMap = {};
    isAuthenticated = false;
    isCurrenciesLoaded = false;
    protected orderCreator!: OrderCreator;
    protected orderFiller!: OrderFiller;
    protected orderTracker!: OrderTracker;
    protected wallet!: Wallet;
    protected candles: Record<string, CandleManager> = {};
    protected readonly connection: Connection;
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

    setOrderFiller(orderFiller: OrderFiller) {
        this.orderFiller = orderFiller;
    }

    getOrderTracker() {
        return this.orderTracker;
    }

    setOrderTracker(orderTracker: OrderTracker) {
        this.orderTracker = orderTracker;
    }

    setWallet(wallet: Wallet) {
        this.wallet = wallet;
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

    /**
     * Verify if the exchange is ready and trigger the "ready" event if ready.
     * Can be called multiple times.. it will trigger the "ready" event only once.
     * @returns {boolean}
     */
    isReady(): boolean {
        if (this.ready) return this.ready;

        // @TODO is fee determined?
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
