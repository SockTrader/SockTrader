import OrderTracker from "../../order/orderTracker";
import {IConnection} from "../../types/IConnection";
import {IOrderCreator} from "../../types/IOrderCreator";
import {IOrder, OrderSide} from "../../types/order";
import {Pair} from "../../types/pair";
import {generateOrderId} from "../../utils/utils";
import HitBTCCommand from "../commands/hitBTCCommand";

export default class HitBTCOrderCreator implements IOrderCreator {

    constructor(private readonly orderTracker: OrderTracker, private readonly connection: IConnection) {
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
