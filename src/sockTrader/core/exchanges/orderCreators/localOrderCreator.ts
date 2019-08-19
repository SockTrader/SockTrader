import Wallet from "../../assets/wallet";
import {ICandle} from "../../types/ICandle";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../../types/order";
import {OrderCreator} from "../../types/orderCreator";
import {Pair} from "../../types/pair";
import OrderTracker from "../utils/orderTracker";
import {generateOrderId} from "../utils/utils";

export default class LocalOrderCreator implements OrderCreator {

    currentCandle?: ICandle = undefined;

    constructor(private orderTracker: OrderTracker, private wallet: Wallet) {
    }

    setCurrentCandle(candle: ICandle) {
        this.currentCandle = candle;
    }

    cancelOrder(order: IOrder) {
        this.orderTracker.setOrderUnconfirmed(order.id);
        return {...order, reportType: ReportType.CANCELED};
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide) {
        if (!this.currentCandle) throw new Error("Cannot create order. Current candle is undefined.");

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
        this.orderTracker.setOrderUnconfirmed(order.id);

        return order;
    }

    adjustOrder(order: IOrder, price: number, qty: number) {
        if (!this.currentCandle) throw new Error("Cannot adjust order. Current candle is undefined.");

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
        this.orderTracker.setOrderUnconfirmed(order.id);

        return newOrder;
    }
}
