import config from "../../../../config";
import Wallet from "../../assets/wallet";
import {ICandle} from "../../types/ICandle";
import {ICandleInterval} from "../../types/ICandleInterval";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../../types/order";
import {OrderReportingBehaviour} from "../../types/OrderReportingBehaviour";
import {Pair} from "../../types/pair";
import BaseExchange from "../baseExchange";
import OrderManager from "../utils/orderManager";
import {generateOrderId} from "../utils/utils";

export default class BacktestReportingBehaviour implements OrderReportingBehaviour {

    private filledOrders: IOrder[] = [];
    private currentCandle: ICandle | undefined;
    private wallet: Wallet = new Wallet(config.assets);

    constructor(private orderManager: OrderManager, private exchange: BaseExchange) {
    }

    private isOrderWithinCandle(order: IOrder, candle: ICandle) {
        return ((order.side === OrderSide.BUY && candle.low < order.price) || (order.side === OrderSide.SELL && candle.high > order.price));
    }

    /**
     * Checks if open order can be filled on each price update
     * @param {ICandle} candle the current candle
     */
    private processOpenOrders(candle: ICandle): void {
        const openOrders: IOrder[] = [];

        this.orderManager.getOpenOrders().forEach((openOrder: IOrder) => {
            if (openOrder.createdAt.isAfter(candle.timestamp)) {
                return openOrders.push(openOrder); // Candle should be newer than order!
            }

            const order = {...openOrder, reportType: ReportType.TRADE, status: OrderStatus.FILLED};

            if (this.isOrderWithinCandle(openOrder, candle)) {
                this.filledOrders.push(order);
                return this.exchange.onReport(order);
            }

            openOrders.push(openOrder);
        });
        this.orderManager.setOpenOrders(openOrders);
    }

    onSnapshotCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void {
        this.currentCandle = data[0];
        this.processOpenOrders(this.currentCandle);
    }

    onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void {
        this.currentCandle = data[0];
        this.processOpenOrders(this.currentCandle);
    }

    cancelOrder(order: IOrder) {
        this.orderManager.setOrderUnconfirmed(order.id);
        return {...order, reportType: ReportType.CANCELED};
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide) {
        if (!this.currentCandle) throw new Error("Cannot create order. No candles have been emitted.");

        const candleTime = this.currentCandle.timestamp;
        const order: IOrder = {
            createdAt: candleTime,
            updatedAt: candleTime,
            status: OrderStatus.NEW,
            timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
            id: generateOrderId(pair),
            type: OrderType.LIMIT,
            reportType: ReportType.NEW,
            side,
            pair,
            quantity: qty,
            price,
        };

        if (!this.wallet.isOrderAllowed(order)) return;

        this.wallet.updateAssets(order);
        this.orderManager.setOrderUnconfirmed(order.id);

        return order;
    }

    adjustOrder(order: IOrder, price: number, qty: number) {
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

        this.wallet.updateAssets(newOrder, order);
        this.orderManager.setOrderUnconfirmed(order.id);

        return newOrder;
    }
}
