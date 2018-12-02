import moment = require("moment");
import {ICandle, ICandleInterval} from "../candleCollection";
import {IExchange} from "../exchanges/exchangeInterface";
import logger from "../logger";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../orderInterface";
import BaseStrategy, {IStrategyClass} from "./baseStrategy";

export interface IBacktestConfiguration {
    candles: ICandle[];
    capital: number;
    interval: ICandleInterval;
}

export default <T extends BaseStrategy>(Strategy: IStrategyClass<T>) => (config?: IBacktestConfiguration) => {
    const baseOrder = {
        createdAt: moment(),
        updatedAt: moment(),
        status: OrderStatus.NEW,
        timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
    };

    return class BackTest extends (Strategy as IStrategyClass<BaseStrategy>) {
        filledOrders: IOrder[] = [];

        openOrders: IOrder[] = [];

        constructor(public pair: string, public exchange: IExchange) {
            super(pair, exchange);

            if (typeof config !== "undefined") {
                // @ts-ignore
                this.decoupleExchange();
                this.exchange.once("ready", () => this.emitCandles(config.candles, config.interval));
            }
        }

        /**
         * Prevents the exchange from connecting with the remote exchange
         */
        decoupleExchange() {
            this.exchange.connect = () => {
                logger.info("Strategy is ready for backtest!");
                this.exchange.emit("ready");
            };

            this.exchange.send = (method: string, params = {}) => {
                logger.info("Event silenced by backtest :" + JSON.stringify({event: method, params}));
            };
        }

        /**
         * Intercept the emit events of the strategy and store the values internally
         * instead of forwarding the events to the exchange.
         *
         * @param event
         * @param args
         */
        emit(event: string | symbol, ...args: any[]): boolean {
            const [data] = args;

            if (event.toString() === "app.signal") {
                const orderId = this.exchange.generateOrderId(data.symbol);
                const order: IOrder = {
                    ...baseOrder,
                    id: orderId,
                    type: OrderType.LIMIT,
                    reportType: ReportType.NEW,
                    side: data.side,
                    symbol: data.symbol,
                    quantity: data.qty,
                    price: data.price,
                };
                this.openOrders.push(order);
                this.notifyOrder(order);
                return false;
            }

            if (event.toString() === "app.adjustOrder") {
                const oldOrder = this.openOrders.find(oo => oo.id === data.order.id) as IOrder;
                const orderId = this.exchange.generateOrderId(data.symbol);
                const order: IOrder = {
                    ...oldOrder,
                    id: orderId,
                    updatedAt: moment(),
                    type: OrderType.LIMIT,
                    originalId: data.order.id,
                    quantity: data.qty,
                    price: data.price,
                };

                this.openOrders.push(order);
                this.openOrders = this.openOrders.filter(oo => oo.id !== data.order.id);

                this.notifyOrder(order);
                return false;
            }

            return super.emit(event, ...args);
        }

        /**
         * Creates an expanding list of candles. And triggers the exchange so that it processes the candles
         * as if it were candles coming from the remote exchange
         *
         * @param candles
         * @param interval
         */
        emitCandles(candles: ICandle[], interval: ICandleInterval): void {
            candles.reduce<ICandle[]>((acc, val) => {
                const processedCandles = [val, ...acc];
                this.exchange.emit("app.updateCandles", processedCandles);
                return processedCandles;
            }, []);
        }

        /**
         * Validates if an open order can be closed by comparing the current candle values
         * with the values of an open order
         *
         * @param candle
         */
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

        /**
         * The backtest will listen for new candles and process the openOrders.
         *
         * @param candles
         */
        updateCandles(candles: ICandle[]): void {
            this.processOpenOrders(candles[0]);
            super.updateCandles(candles);
        }
    };
};
