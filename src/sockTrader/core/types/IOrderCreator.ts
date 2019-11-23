import {IOrder, OrderSide} from "./order";
import {Pair} from "./pair";

export interface IOrderCreator {

    cancelOrder(order: IOrder): IOrder | void;

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): IOrder | void;

    adjustOrder(order: IOrder, price: number, qty: number): IOrder | void;

}
