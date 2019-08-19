import OrderTracker from "../exchanges/utils/orderTracker";
import {ICandle} from "./ICandle";
import {ICandleInterval} from "./ICandleInterval";
import {IOrder, OrderSide} from "./order";
import {Pair} from "./pair";

export declare class OrderReportingBehaviour {

    constructor(orderManager: OrderTracker);

    onSnapshotCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void;

    onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void;

    cancelOrder(order: IOrder): IOrder | void;

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): IOrder | void;

    adjustOrder(order: IOrder, price: number, qty: number): IOrder | void;

}
