import moment from "moment";
import {ICandle, ICandleInterval} from "../candleCollection";
import {IExchange} from "../exchanges/exchangeInterface";
import logger from "../logger";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../orderInterface";
import BaseStrategy, {ISignal, IStrategyClass} from "./baseStrategy";

export interface IBacktestConfiguration {
    candles?: ICandle[];
    capital: number;
    interval?: ICandleInterval;
}

export default <T extends BaseStrategy>(Strategy: IStrategyClass<T>) => (config: IBacktestConfiguration) => {
    return class BackTest extends (Strategy as IStrategyClass<BaseStrategy>) {

        capital: number = config.capital;
        filledOrders: IOrder[] = [];
        openOrders: IOrder[] = [];
        progress = 0;

        constructor(public pair: string, public exchange: IExchange) {
            super(pair, exchange);

            if (config.candles !== undefined && config.interval !== undefined) {
                // @ts-ignore
                this.decoupleExchange();
                this.exchange.once("ready", () => this.emitCandles(config.candles as ICandle[], config.interval as ICandleInterval));
            }
        }

        /**
         * Creates an adjusted clone of an IOrder instance
         * @param order
         * @param price
         * @param quantity
         */
        createOrderFromOrder(order: IOrder, price: number, quantity: number): IOrder {
            const candleTime = (config.candles === undefined) ? moment() : config.candles[this.progress].timestamp;
            const orderId = this.exchange.generateOrderId(order.symbol);

            return {
                ...order,
                id: orderId,
                updatedAt: candleTime,
                type: OrderType.LIMIT,
                originalId: order.id,
                quantity,
                price,
            };
        }

        /**
         * Converts strategy signal into an IOrder instance
         * @param signal
         */
        createOrderFromSignal(signal: ISignal): IOrder {
            const candleTime = (config.candles === undefined) ? moment() : config.candles[this.progress].timestamp;

            return {
                createdAt: candleTime,
                updatedAt: candleTime,
                status: OrderStatus.NEW,
                timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
                id: this.exchange.generateOrderId(signal.symbol),
                type: OrderType.LIMIT,
                reportType: ReportType.NEW,
                side: signal.side,
                symbol: signal.symbol,
                quantity: signal.qty,
                price: signal.price,
            };
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
                const order = this.createOrderFromSignal(data);

                this.openOrders.push(order);
                this.notifyOrder(order);
                return false;
            }

            if (event.toString() === "app.adjustOrder") {
                const oldOrder = this.openOrders.find(oo => oo.id === data.order.id) as IOrder;
                const order = this.createOrderFromOrder(oldOrder, data.price, data.qty);

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
         * @param c
         * @param interval
         */
        emitCandles(c: ICandle[], interval: ICandleInterval): void {
            const candles = (c[c.length - 1].timestamp.isBefore(c[0].timestamp)) ? c.reverse() : c;

            candles.reduce<ICandle[]>((acc, val, idx) => {
                const processedCandles = [val, ...acc];
                this.progress = idx;
                this.exchange.emit("app.updateCandles", processedCandles);
                return processedCandles;
            }, []);
        }

        notifyOrder(order: IOrder): void {
            super.notifyOrder(order);
            if (order.status !== OrderStatus.FILLED) {
                return;
            }

            if (order.side === OrderSide.BUY) {
                this.capital -= (order.price * order.quantity);
                // console.log("capital: ", this.capital, "\n");
            } else if (order.side === OrderSide.SELL) {
                this.capital += (order.price * order.quantity);
                // console.log("capital: ", this.capital, "\n");
            }
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
