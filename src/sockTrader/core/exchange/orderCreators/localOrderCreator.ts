import moment, {Moment} from "moment";
import OrderTracker from "../../order/orderTracker";
import Wallet from "../../wallet/wallet";
import {Candle} from "../../types/candle";
import {Order, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../../types/order";
import {OrderCreator} from "../../types/orderCreator";
import {Pair} from "../../types/pair";
import {generateOrderId} from "../../utils/utils";

export default class LocalOrderCreator implements OrderCreator {

    currentCandle?: Candle = undefined;

    constructor(private readonly orderTracker: OrderTracker, private readonly wallet: Wallet) {
    }

    setCurrentCandle(candle: Candle) {
        this.currentCandle = candle;
    }

    cancelOrder(order: Order) {
        this.orderTracker.setOrderUnconfirmed(order.id);
        this.orderTracker.process({...order, status: OrderStatus.CANCELED, reportType: ReportType.CANCELED});
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide) {
        const candleTime = this.getTimeOfOrder();

        const order: Order = {
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

        if (!this.wallet.isOrderAllowed(order)) return; // @TODO remove dependency

        this.wallet.updateAssets(order); // @TODO remove dependency
        this.orderTracker.setOrderUnconfirmed(order.id);
        this.orderTracker.process(order);
    }

    adjustOrder(order: Order, price: number, qty: number) {
        const newOrder: Order = {
            ...order,
            id: generateOrderId(order.pair),
            updatedAt: this.getTimeOfOrder(),
            reportType: ReportType.REPLACED,
            status: OrderStatus.NEW,
            type: OrderType.LIMIT,
            originalId: order.id,
            quantity: qty,
            price,
        };

        if (!this.wallet.isOrderAllowed(newOrder)) return; // @TODO remove dependency

        this.wallet.updateAssets(newOrder, order); // @TODO remove dependency
        this.orderTracker.setOrderUnconfirmed(order.id);
        this.orderTracker.process(newOrder);
    }

    /**
     * Will return the timestamp of the current candle if it has been set.
     * Otherwise it will return the actual server time.
     *
     * PaperTrading: create order based on the actual server time
     * BackTesting: create order based on the current candle time
     */
    private getTimeOfOrder(): Moment {
        return this.currentCandle ? this.currentCandle.timestamp : moment();
    }
}
