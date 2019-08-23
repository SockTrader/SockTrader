import {IConnection} from "../../types/IConnection";
import {IOrder, OrderSide} from "../../types/order";
import {OrderCreator} from "../../types/orderCreator";
import {Pair} from "../../types/pair";
import HitBTCCommand from "../commands/hitBTCCommand";
import OrderTracker from "../utils/orderTracker";
import {generateOrderId} from "../utils/utils";

export default class HitBTCOrderCreator implements OrderCreator {

    constructor(private orderTracker: OrderTracker, private connection: IConnection) {
    }

    cancelOrder(order: IOrder): IOrder | void {
        this.orderTracker.setOrderUnconfirmed(order.id);
        this.connection.send(new HitBTCCommand("cancelOrder", {clientOrderId: order.id}));
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): IOrder | void {
        const orderId = generateOrderId(pair);
        this.orderTracker.setOrderUnconfirmed(orderId);

        this.connection.send(new HitBTCCommand("newOrder", {
            clientOrderId: orderId,
            price,
            quantity: qty,
            side,
            symbol: pair,
            type: "limit",
        }));
    }

    adjustOrder(order: IOrder, price: number, qty: number): IOrder | void {
        if (this.orderTracker.isOrderUnconfirmed(order.id)) return;
        if (order.price === price && order.quantity === qty) return; // No need to replace!

        this.orderTracker.setOrderUnconfirmed(order.id);

        const newOrderId = generateOrderId(order.pair);
        this.connection.send(new HitBTCCommand("cancelReplaceOrder", {
            clientOrderId: order.id,
            price,
            quantity: qty,
            requestClientId: newOrderId,
            strictValidate: true,
        }));
    }
}
