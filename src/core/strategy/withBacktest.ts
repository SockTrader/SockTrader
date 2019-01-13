import moment from "moment";
import CapitalAnalyzer, {IAnalyzer} from "../analyzers/capitalAnalyzer";
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
        analyzers: IAnalyzer[] = [
            new CapitalAnalyzer(config.capital),
        ];
        capital: number = config.capital;
        filledOrders: IOrder[] = [];
        openOrders: IOrder[] = [];
        progress = 0;

        constructor(public pair: string, public exchange: IExchange) {
            super(pair, exchange);

            if (config.candles !== undefined && config.interval !== undefined) {
                this.decoupleExchange();
                this.exchange.once("ready", () => {
                    this.emit("backtest.candles", config.candles);
                    this.emitCandles(config.candles as ICandle[], config.interval as ICandleInterval);
                });
            }
        }

        // @TODO remove me! should be calculated by an analyzer
        analyze(order: IOrder) {
            if (order.status !== OrderStatus.FILLED) {
                return;
            }

            const oldCapital = this.capital;
            if (order.side === OrderSide.BUY) {
                this.capital -= (order.price * order.quantity);
            } else if (order.side === OrderSide.SELL) {
                this.capital += (order.price * order.quantity);
            }

            console.log("capital: ", this.capital, " : ", this.calcPerc(oldCapital, this.capital), "\n");
        }

        // @TODO remove me! should be calculated by an analyzer
        calcPerc(a: number, b: number): string {
            if (b > a) {
                return `+${(b - a) / a * 100}%`;
            } else {
                return `-${(b - a) / b * 100}%`;
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

            if (event === "app.signal") {
                this.onSignal(data);
                return false;
            } else if (event === "app.adjustOrder") {
                this.onAdjustOrder(data);
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
            this.emit("backtest.report", order);
            // this.analyzers.forEach((analyzer: IAnalyzer) => {
            //     analyzer.analyze(order);
            // });

            this.analyze(order);
        }

        onAdjustOrder(event: any) {
            const oldOrder = this.openOrders.find(oo => oo.id === event.order.id) as IOrder;
            const order = this.createOrderFromOrder(oldOrder, event.price, event.qty);

            this.openOrders.push(order);
            this.openOrders = this.openOrders.filter(oo => oo.id !== event.order.id);
            this.notifyOrder(order);
        }

        onSignal(event: any) {
            const order = this.createOrderFromSignal(event);
            this.openOrders.push(order);
            this.notifyOrder(order);
        }

        /**
         * Validates if an open order can be closed by comparing the current candle values
         * with the values of an open order
         *
         * @param candle
         */
        processOpenOrders(candle: ICandle): void {
            const openOrders: IOrder[] = [];
            this.openOrders.forEach(oo => {
                if (oo.createdAt.isAfter(candle.timestamp)) {
                    return openOrders.push(oo); // Candle should be newer than order!
                }

                const order = {...oo, reportType: ReportType.TRADE, status: OrderStatus.FILLED};
                if (oo.side === OrderSide.BUY && candle.low < oo.price && this.fillBuyOrder(order)) {
                    this.filledOrders.push(order);
                    return this.notifyOrder(order);
                }

                if (oo.side === OrderSide.SELL && candle.high > oo.price && this.fillSellOrder(order)) {
                    this.filledOrders.push(order);
                    return this.notifyOrder(order);
                }

                openOrders.push(oo);
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

        /**
         * Fill buy order if a user has enough quantity of the base asset
         *
         * @param order
         */
        private fillBuyOrder(order: IOrder): boolean {
            const orders = [...this.openOrders, order];
            const requiredCapital: number = orders.reduce<number>((acc, cur) => {
                return (cur.side === OrderSide.BUY) ? acc + (cur.quantity * cur.price) : acc;
            }, 0);

            // @TODO possible bug! this.capital is not updated after the analyzers did their thing..
            return (this.capital >= requiredCapital);
        }

        /**
         * Fill sell order if a user has bought enough quantity of that same asset
         *
         * @param order
         */
        private fillSellOrder(order: IOrder): boolean {
            const qty: number = this.filledOrders.reduce<number>((acc, cur) => {
                if (cur.side === OrderSide.BUY) {
                    acc += cur.quantity;
                } else {
                    acc -= cur.quantity;
                }
                return acc;
            }, 0);

            return (qty <= order.quantity);
        }
    };
};
