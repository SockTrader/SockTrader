import OrderTracker from "../../order/orderTracker";
import {Connection} from "../../types/Connection";
import {Order, OrderSide} from "../../types/order";
import {OrderCreator} from "../../types/OrderCreator";
import {Pair} from "../../types/pair";
import {generateOrderId} from "../../utils/utils";
import HitBTCCommand from "../commands/hitBTCCommand";

export default class HitBTCOrderCreator implements OrderCreator {

    constructor(private readonly orderTracker: OrderTracker, private readonly connection: Connection) {
    }

    cancelOrder(order: Order): Order | void {
        this.orderTracker.setOrderUnconfirmed(order.id);
        this.connection.send(new HitBTCCommand("cancelOrder", {clientOrderId: order.id}));
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): Order | void {
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

    adjustOrder(order: Order, price: number, qty: number): Order | void {
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
