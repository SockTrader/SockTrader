import moment = require("moment");
import {ICandle} from "../candleCollection";
import {IExchange} from "../exchanges/exchangeInterface";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../orderInterface";
import BaseStrategy, {IStrategyClass} from "./baseStrategy";

export default <T extends BaseStrategy>(Strategy: IStrategyClass<T>) => {
    const baseOrder = {
        createdAt: moment(),
        cumQuantity: 0,
        status: OrderStatus.NEW,
        timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
        type: OrderType.MARKET,
        updatedAt: moment(),
    };

    return class BackTest extends (Strategy as IStrategyClass<BaseStrategy>) {
        filledOrders: IOrder[] = [];

        openOrders: IOrder[] = [];

        constructor(public pair: string, public exchange: IExchange) {
            super(pair, exchange);
        }

        emit(event: string | symbol, ...args: any[]): boolean {
            const [data] = args;

            if (event.toString() === "app.signal") {
                const orderId = this.exchange.generateOrderId(data.symbol);
                const order = {
                    ...baseOrder,
                    id: orderId,
                    reportType: ReportType.NEW,
                    side: data.side,
                    clientOrderId: orderId,
                    symbol: data.symbol,
                    quantity: data.qty,
                    price: data.price,
                };
                this.openOrders.push(order);
                this.notifyOrder(order);
                return false;
            }

            if (event.toString() === "app.adjustOrder") {
                const oldOrder = this.openOrders.find(oo => oo.id === data.order.id);
                const orderId = this.exchange.generateOrderId(data.symbol);
                const order = {
                    ...oldOrder,
                    updatedAt: moment(),
                    id: orderId,
                    clientOrderId: orderId,
                    originalRequestClientOrderId: data.order.id,
                    quantity: data.qty,
                    price: data.price,
                } as IOrder;

                this.openOrders.push(order);
                this.openOrders = this.openOrders.filter(oo => oo.id !== data.order.id);

                this.notifyOrder(order);
                return false;
            }

            return super.emit(event, ...args);
        }

        processOpenOrders(candle: ICandle): void {
            const openOrders: IOrder[] = [];
            this.openOrders.forEach(order => {
                if (order.createdAt.isAfter(candle.timestamp)) {
                    return openOrders.push(order); // Candle should be newer than order!
                }

                const filledReport = {...order, reportType: ReportType.TRADE, status: OrderStatus.FILLED};
                if ((order.side === OrderSide.BUY && candle.low < order.price) ||
                    (order.side === OrderSide.SELL && candle.high > order.price)) {
                    this.notifyOrder(filledReport);
                    return this.filledOrders.push(filledReport);
                }

                openOrders.push(order);
            });
            this.openOrders = openOrders;
        }

        updateCandles(candles: ICandle[]): void {
            this.processOpenOrders(candles[0]);
            super.updateCandles(candles);
        }
    };
};
