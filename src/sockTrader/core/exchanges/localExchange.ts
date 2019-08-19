import Local from "../connection/local";
import {ICandle} from "../types/ICandle";
import {ICandleInterval} from "../types/ICandleInterval";
import {IConnection} from "../types/IConnection";
import {IOrderbookData} from "../types/IOrderbookData";
import {IOrder, OrderSide} from "../types/order";
import {OrderReportingBehaviour} from "../types/OrderReportingBehaviour";
import {Pair} from "../types/pair";
import BaseExchange from "./baseExchange";
import BacktestReportingBehaviour from "./orderReporting/backtestReportingBehaviour";

/**
 * The LocalExchange resembles a local dummy marketplace for
 * strategy testing
 */
export default class LocalExchange extends BaseExchange {

    protected createConnection(): IConnection {
        return new Local();
    }

    protected loadCurrencies(): void {
        return undefined;
    }

    adjustOrder(order: IOrder, price: number, qty: number) {
        const adjustedOrder = super.adjustOrder(order, price, qty);
        if (adjustedOrder) return this.onReport(adjustedOrder);
    }

    cancelOrder(order: IOrder): IOrder | void {
        const cancelledOrder = super.cancelOrder(order);
        if (cancelledOrder) return this.onReport(cancelledOrder);
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): IOrder | void {
        const createdOrder = super.createOrder(pair, price, qty, side);
        if (createdOrder) return this.onReport(createdOrder);
    }

    /**
     * @TODO We should move sorting into the candle normalizer.
     * @TODO So that the trading bot can assume to always receive clean data.
     * @param candles
     */
    sortCandles(candles: ICandle[]) {
        const isCandleListDescending: boolean = (candles[candles.length - 1].timestamp.isAfter(candles[0].timestamp));
        return !isCandleListDescending ? [...candles].reverse() : candles;
    }

    /**
     * Emits a collection of candles from a local file as if they were sent from a real exchange
     * @param {ICandle[]} candles
     * @returns {Promise<void>} promise
     */
    async emitCandles(candles: ICandle[]) {
        const candleList = this.sortCandles(candles);
        const processedCandles: ICandle[] = [];

        candleList.forEach(value => {
            processedCandles.unshift(value);
            // The values below don't make much sense. But that doesn't really matter because a localExchange
            // will only be used for backtesting. And a backtest will only be ran for 1 pair at a time.
            // The interval will be completely ignored because we're trying to run the script as fast as possible.
            // Assuming that the given data is of good quality (ex: no holes, constant interval rate, etc..)
            this.onUpdateCandles(["LOCAL", "LOCAL"] as Pair, processedCandles, {code: "LOCAL", cron: "*"});
            this.emit("core.updateCandles", processedCandles);
        });
    }

    isReady(): boolean {
        this.emit("ready");
        return true;
    }

    // onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void {
    //     // huge performance overhead when running a backtest and its only useful during paper trading.
    //     if (process.env.SOCKTRADER_TRADING_MODE === "PAPER") {
    //         this.getCandleManager(pair, interval, candles => this.emit("core.updateCandles", candles))
    //             .update(data);
    //     }
    // }

    // Method ignored by localExchange
    onUpdateOrderbook(data: IOrderbookData): void {
        return undefined;
    }

    // Method ignored by localExchange
    subscribeCandles(pair: [string, string], interval: ICandleInterval): void {
        return undefined;
    }

    // Method ignored by localExchange
    subscribeOrderbook(pair: [string, string]): void {
        return undefined;
    }

    // Method ignored by localExchange
    subscribeReports(): void {
        return undefined;
    }

    protected getOrderReportingBehaviour(): OrderReportingBehaviour {
        return new BacktestReportingBehaviour(this.orderTracker, this);
    }
}
