import moment = require("moment");
import {ICandle} from "../candleCollection";
import {IExchange} from "../exchanges/exchangeInterface";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../orderInterface";
import BaseStrategy, {IStrategyClass} from "./baseStrategy";

export default <T extends BaseStrategy>(Strategy: IStrategyClass<T>) => {
    let openOrders: IOrder[] = [];
    const baseOrder = {
        createdAt: moment(),
        cumQuantity: 0,
        status: OrderStatus.NEW,
        timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
        type: OrderType.MARKET,
        updatedAt: moment(),
    };

    return class BackTest extends (Strategy as IStrategyClass<BaseStrategy>) {

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
                openOrders.push(order);
                this.notifyOrder(order);
                return false;
            }

            if (event.toString() === "app.adjustOrder") {
                openOrders = openOrders.filter(oo => oo.id !== data.order.id);
                const orderId = this.exchange.generateOrderId(data.symbol);
                const order = {
                    ...baseOrder,
                    id: orderId,
                    originalRequestClientOrderId: data.order.id,
                    reportType: ReportType.REPLACED,
                    side: data.side,
                    clientOrderId: orderId,
                    symbol: data.symbol,
                    quantity: data.qty,
                    price: data.price,
                };
                openOrders.push(order);
                this.notifyOrder(order);
                return false;
            }

            return super.emit(event, ...args);
        }

        notifyOrder(data: IOrder): void {
            super.notifyOrder(data);
        }

        processOpenOrders(candle: ICandle) {
            openOrders.forEach(order => {
                if (order.createdAt.isAfter(candle.timestamp)) {
                    return; // Candle should be newer than order!
                }

                const filledReport = {...order, reportType: ReportType.TRADE, status: OrderStatus.FILLED};
                if (order.side === OrderSide.BUY && candle.high > order.price) {
                    this.notifyOrder(filledReport);
                    console.log("Buy order filled!");
                } else if (order.side === OrderSide.SELL && candle.low < order.price) {
                    this.notifyOrder(filledReport);
                    console.log("Sell order filled!");
                }
            });
        }

        updateCandles(candles: ICandle[]): void {
            this.processOpenOrders(candles[0]);

            console.log("Candles captured");
            super.updateCandles(candles);
        }

        // updateOrderbook(orderBook: IOrderbook): void {
        //     console.log("Orderbook update captured");
        //     super.updateOrderbook(orderBook);
        // }
    };
};
