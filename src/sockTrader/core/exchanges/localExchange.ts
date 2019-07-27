import Wallet from "../assets/wallet";
import Local from "../connection/local";
import {ICandle} from "../types/ICandle";
import {IConnection} from "../types/IConnection";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../types/order";
import {Pair} from "../types/pair";
import BaseExchange from "./baseExchange";
import {generateOrderId} from "./utils/utils";

/**
 * The LocalExchange resembles a local dummy marketplace for
 * strategy testing
 */
export default class LocalExchange extends BaseExchange {

    private currentCandle?: ICandle;
    private readonly filledOrders: IOrder[] = [];
    private readonly wallet: Wallet;

    /**
     * Creates a new LocalExchange
     */
    constructor(wallet: Wallet) {
        super();
        this.wallet = wallet;

        this.prependListener("core.updateCandles", (candles: ICandle[]) => this.processOpenOrders(candles[0]));
        this.on("core.report", (order: IOrder) => this.wallet.updateAssets(order));
    }

    protected createConnection(): IConnection {
        return new Local();
    }

    adjustOrder(order: IOrder, price: number, qty: number): void {
        if (!this.currentCandle) throw new Error("Cannot adjust order. No candles have been emitted.");

        const newOrder: IOrder = {
            ...order,
            id: generateOrderId(order.pair),
            reportType: ReportType.REPLACED,
            updatedAt: this.currentCandle.timestamp,
            type: OrderType.LIMIT,
            originalId: order.id,
            quantity: qty,
            price,
        };

        if (!this.wallet.isOrderAllowed(newOrder, order)) return;

        this.setOrderInProgress(order.id);
        this.onReport(newOrder);
    }

    cancelOrder(order: IOrder): void {
        this.setOrderInProgress(order.id);
        this.onReport({...order, reportType: ReportType.CANCELED});
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): void {
        if (!this.currentCandle) throw new Error("Cannot create order. No candles have been emitted.");

        const orderId = generateOrderId(pair);
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

        if (!this.wallet.isOrderAllowed(order)) return;

        this.setOrderInProgress(orderId);
        this.onReport(order);
    }

    /**
     * @TODO We should move sorting into the candle normalizer.
     * @TODO So that the trading bot can assume to always receive clean data.
     * @param candles
     */
    sortCandles(candles: ICandle[]) {
        const isCandleListDescending: boolean = (candles[candles.length - 1].timestamp.isAfter(candles[0].timestamp));
        return !isCandleListDescending ? [...candles].reverse() : candles;
    }

    /**
     * Emits a collection of candles from a local file as if they were sent from a real exchange
     * @param {ICandle[]} candles
     * @returns {Promise<void>} promise
     */
    async emitCandles(candles: ICandle[]) {
        const candleList = this.sortCandles(candles);
        const processedCandles: ICandle[] = [];

        candleList.forEach(value => {
            this.currentCandle = value;
            processedCandles.unshift(value);
            this.emit("core.updateCandles", processedCandles);
        });
    }

    isReady(): boolean {
        this.emit("ready");
        return true;
    }

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

    loadCurrencies = (): void => undefined;

    // noinspection JSUnusedGlobalSymbols
    onUpdateCandles = (): void => undefined;

    // noinspection JSUnusedGlobalSymbols
    onUpdateOrderbook = (): void => undefined;

    subscribeCandles = (): void => undefined;

    subscribeOrderbook = (): void => undefined;

    subscribeReports = (): void => undefined;
}
