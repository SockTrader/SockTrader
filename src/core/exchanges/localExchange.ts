import {Pair} from "../../types/pair";
import {ICandle} from "../candleCollection";
import CandleLoader from "../candleLoader";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../orderInterface";
import BaseExchange from "./baseExchange";

export interface IAssetMap {
    [key: string]: number;
}

export default class LocalExchange extends BaseExchange {

    private static instance?: LocalExchange;
    private assets: IAssetMap = {
        USD: 100000,
    };
    private currentCandle?: ICandle;
    private filledOrders: IOrder[] = [];

    constructor() {
        super();

        this.prependListener("app.updateCandles", (candles: ICandle[]) => this.processOpenOrders(candles[0]));
        this.on("app.report", (order: IOrder) => this.updateAssets(order));
    }

    static getInstance() {
        if (!LocalExchange.instance) {
            LocalExchange.instance = new LocalExchange();
        }
        return LocalExchange.instance;
    }

    /**
     * Adjusts existing order on exchange
     * @param order
     * @param price
     * @param qty
     */
    adjustOrder(order: IOrder, price: number, qty: number): void {
        if (!this.currentCandle) {
            throw new Error("Current candle undefined. Emit candles before adjusting an order.");
        }

        this.setOrderInProgress(order.id);
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

        this.onReport(newOrder);
    }

    /**
     * Cancel existing order on exchange
     */
    cancelOrder(order: IOrder): void {
        this.setOrderInProgress(order.id);

        const canceledOrder: IOrder = {
            ...order,
            reportType: ReportType.CANCELED,
        };

        this.onReport(canceledOrder);
    }

    /**
     * Sends new order to exchange
     */
    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): string {
        if (!this.currentCandle) {
            throw new Error("Current candle undefined. Emit candles before creating an order.");
        }

        const orderId = super.createOrder(pair, price, qty, side);

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

        this.onReport(order);
        return orderId;
    }

    async emitCandles(loader: CandleLoader) {
        const candles = (await loader.parse()).toArray();
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

    processOpenOrders(candle: ICandle): void {
        const openOrders: IOrder[] = [];
        this.openOrders.forEach(oo => {
            if (oo.createdAt.isAfter(candle.timestamp)) {
                return openOrders.push(oo); // Candle should be newer than order!
            }

            const order = {...oo, reportType: ReportType.TRADE, status: OrderStatus.FILLED};
            if (oo.side === OrderSide.BUY && candle.low < oo.price && this.isBuyAllowed(order)) {
                this.filledOrders.push(order);
                return this.onReport(order);
            }

            if (oo.side === OrderSide.SELL && candle.high > oo.price && this.isSellAllowed(order)) {
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

    private getOrderPrice(price: number, qty: number) {
        return price * qty;
    }

    private isBuyAllowed(order: IOrder): boolean {
        const pair: Pair = order.pair;
        const orderPrice: number = this.getOrderPrice(order.price, order.quantity);

        return this.assets[pair[1]] > orderPrice;
    }

    private isSellAllowed(order: IOrder): boolean {
        const pair: Pair = order.pair;
        const orderPrice: number = this.getOrderPrice(order.price, order.quantity);

        return this.assets[pair[0]] > orderPrice;
    }

    private updateAssets(order: IOrder, oldOrder?: IOrder) {
        let [target, source] = order.pair;

        if (order.side === OrderSide.SELL) {
            target = order.pair[1];
            source = order.pair[0];
        }

        if (ReportType.REPLACED === order.reportType && oldOrder) {
            this.assets[source] += this.getOrderPrice(oldOrder.price, oldOrder.quantity);
            this.assets[source] -= this.getOrderPrice(order.price, order.quantity);
        } else if (ReportType.NEW === order.reportType) {
            this.assets[source] -= this.getOrderPrice(order.price, order.quantity);
        } else if (ReportType.TRADE === order.reportType && OrderStatus.FILLED === order.status) {
            this.assets[target] += this.getOrderPrice(order.price, order.quantity);
            console.log(this.assets);
        } else if ([ReportType.CANCELED, ReportType.EXPIRED, ReportType.SUSPENDED].indexOf(order.reportType) > -1) {
            this.assets[source] += this.getOrderPrice(order.price, order.quantity);
        }
    }
}
