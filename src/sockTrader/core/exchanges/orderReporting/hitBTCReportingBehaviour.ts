import {EventEmitter} from "events";
import logger from "../../logger";
import {ICandle} from "../../types/ICandle";
import {ICandleInterval} from "../../types/ICandleInterval";
import {IConnection} from "../../types/IConnection";
import {IOrder, OrderSide} from "../../types/order";
import {Pair} from "../../types/pair";
import HitBTCCommand from "../commands/hitBTCCommand";
import OrderTracker from "../utils/orderTracker";
import {generateOrderId} from "../utils/utils";
import WebsocketReportingBehaviour from "./websocketReportingBehaviour";

export default class HitBTCReportingBehaviour extends WebsocketReportingBehaviour {

    constructor(orderTracker: OrderTracker, connection: IConnection, private exchange: EventEmitter) {
        super(orderTracker, connection);
    }

    onSnapshotCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void {
        this.getCandleManager(pair, interval, candles => this.exchange.emit("core.updateCandles", candles))
            .set(data);
    }

    onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void {
        this.getCandleManager(pair, interval, candles => this.exchange.emit("core.updateCandles", candles))
            .update(data);
    }

    cancelOrder(order: IOrder): IOrder | void {
        this.orderTracker.setOrderUnconfirmed(order.id);
        this.connection.send(new HitBTCCommand("cancelOrder", {clientOrderId: order.id}));
    }

    createOrder(pair: [string, string], price: number, qty: number, side: OrderSide): IOrder | void {
        const orderId = generateOrderId(pair);
        this.orderTracker.setOrderUnconfirmed(orderId);

        logger.info(`PRODUCTION ${side.toUpperCase()} ORDER! PRICE: ${price} SIZE: ${qty}`);
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
        if (this.orderTracker.canAdjustOrder(order, price, qty)) {
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
}
