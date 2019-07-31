import Local from "../connection/local";
import {ICandle} from "../types/ICandle";
import {ICandleInterval} from "../types/ICandleInterval";
import {IConnection} from "../types/IConnection";
import {IOrderbookData} from "../types/IOrderbookData";
import {IOrder, OrderSide} from "../types/order";
import {Pair} from "../types/pair";
import BaseExchange from "./baseExchange";
import {backtest} from "./decorators/backtest";

/**
 * The LocalExchange resembles a local dummy marketplace for
 * strategy testing
 */
@backtest
export default class LocalExchange extends BaseExchange {

    protected createConnection(): IConnection {
        return new Local();
    }

    protected loadCurrencies(): void {
        return undefined;
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

    // Method implemented by decorator
    adjustOrder(order: IOrder, price: number, qty: number): void {
        return undefined;
    }

    // Method implemented by decorator
    cancelOrder(order: IOrder): void {
        return undefined;
    }

    // Method implemented by decorator
    createOrder(pair: [string, string], price: number, qty: number, side: OrderSide): void {
        return undefined;
    }

    onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void {
        this.getCandleManager(pair, interval, candles => this.emit("core.updateCandles", candles))
            .update(data);
    }

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
}
