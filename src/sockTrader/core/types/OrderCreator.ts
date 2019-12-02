import {Order, OrderSide} from "./order";
import {Pair} from "./pair";

export interface OrderCreator {

    cancelOrder(order: Order): Order | void;

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): Order | void;

    adjustOrder(order: Order, price: number, qty: number): Order | void;

}
