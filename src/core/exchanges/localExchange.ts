import {ICandle} from "../candles/candleCollection";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../types/order";
import {Pair} from "../types/pair";
import Wallet from "../assets/wallet";
import BaseExchange from "./baseExchange";

/**
 * The LocalExchange resembles a local dummy marketplace for
 * strategy testing
 */
export default class LocalExchange extends BaseExchange {

    private static instance?: LocalExchange;
    private currentCandle?: ICandle;
    private filledOrders: IOrder[] = [];

    /**
     * Creates a new LocalExchange
     */
    constructor(private wallet: Wallet) {
        super();

        this.prependListener("app.updateCandles", (candles: ICandle[]) => this.processOpenOrders(candles[0]));
        this.on("app.report", (order: IOrder) => this.wallet.updateAssets(order));
    }

    /**
     * Returns singleton instance of local exchange
     * @returns {LocalExchange} the new local exchange
     */
    static getInstance(wallet: Wallet) {
        if (!LocalExchange.instance) {
            LocalExchange.instance = new LocalExchange(wallet);
        }
        return LocalExchange.instance;
    }

    adjustOrder(order: IOrder, price: number, qty: number): void {
        if (!this.currentCandle) {
            throw new Error("Current candle undefined. Emit candles before adjusting an order.");
        }

        const newOrder: IOrder = {
            ...order,
            id: this.generateOrderId(order.pair),
            reportType: ReportType.REPLACED,
            updatedAt: this.currentCandle.timestamp,
            type: OrderType.LIMIT,
            originalId: order.id,
            quantity: qty,
            price,
        };

        if (!this.isOrderAllowed(newOrder, order)) return;

        this.setOrderInProgress(order.id);
        this.onReport(newOrder);
    }

    cancelOrder(order: IOrder): void {
        this.setOrderInProgress(order.id);

        const canceledOrder: IOrder = {
            ...order,
            reportType: ReportType.CANCELED,
        };

        this.onReport(canceledOrder);
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): void {
        if (!this.currentCandle) {
            throw new Error("Current candle undefined. Emit candles before creating an order.");
        }

        const orderId = this.generateOrderId(pair);
        const candleTime = this.currentCandle.timestamp;

        const order: IOrder = {
            createdAt: candleTime,
            updatedAt: candleTime,
            status: OrderStatus.NEW,
            timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
            id: orderId,
            type: OrderType.LIMIT,
            reportType: ReportType.NEW,
            side,
            pair,
            quantity: qty,
            price,
        };

        if (!this.isOrderAllowed(order)) return;

        this.setOrderInProgress(orderId);
        this.onReport(order);
    }

    /**
     * Emits a collection of candles from a local file as if they were
     * sent from a real exchange
     * @param {ICandle[]} candles
     * @returns {Promise<void>} promise
     */
    async emitCandles(candles: ICandle[]) {
        const normCandles: ICandle[] = (candles[candles.length - 1].timestamp.isBefore(candles[0].timestamp))
            ? candles.reverse()
            : candles;

        normCandles.reduce<ICandle[]>((acc, val, idx) => {
            const processedCandles = [val, ...acc];
            this.currentCandle = val;
            this.emit("app.updateCandles", processedCandles);
            return processedCandles;
        }, []);
    }

    isReady(): boolean {
        this.emit("ready");
        return true;
    }

    loadCurrencies = (): void => undefined;

    // noinspection JSUnusedGlobalSymbols
    onUpdateCandles = (): void => undefined;

    // noinspection JSUnusedGlobalSymbols
    onUpdateOrderbook = (): void => undefined;

    /**
     * Checks if open order can be filled on each price update
     * @param {ICandle} candle the current candle
     */
    processOpenOrders(candle: ICandle): void {
        const openOrders: IOrder[] = [];
        this.openOrders.forEach(oo => {
            if (oo.createdAt.isAfter(candle.timestamp)) {
                return openOrders.push(oo); // Candle should be newer than order!
            }

            const order = {...oo, reportType: ReportType.TRADE, status: OrderStatus.FILLED};
            if (oo.side === OrderSide.BUY && candle.low < oo.price) {
                this.filledOrders.push(order);
                return this.onReport(order);
            }

            if (oo.side === OrderSide.SELL && candle.high > oo.price) {
                this.filledOrders.push(order);
                return this.onReport(order);
            }

            openOrders.push(oo);
        });
        this.openOrders = openOrders;
    }

    subscribeCandles = (): void => undefined;

    subscribeOrderbook = (): void => undefined;

    subscribeReports = (): void => undefined;

    /**
     * Validates if the wallet has sufficient funds to cover the given order.
     * @param order
     * @param oldOrder
     */
    private isOrderAllowed(order: IOrder, oldOrder?: IOrder): boolean {
        const isAllowed = order.side === OrderSide.BUY ? this.wallet.isBuyAllowed : this.wallet.isSellAllowed;
        return isAllowed.bind(this.wallet)(order, oldOrder);
    }
}
