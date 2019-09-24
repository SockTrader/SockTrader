import Local from "../connection/local";
import {CandleProcessor} from "../types/candleProcessor";
import {ICandle} from "../types/ICandle";
import {ICandleInterval} from "../types/ICandleInterval";
import {IConnection} from "../types/IConnection";
import {IOrderbookData} from "../types/IOrderbookData";
import {IOrder, OrderSide} from "../types/order";
import {OrderCreator} from "../types/orderCreator";
import {Pair} from "../types/pair";
import BaseExchange from "./baseExchange";
import LocalCandleProcessor from "./candleProcessors/localCandleProcessor";
import LocalOrderCreator from "./orderCreators/localOrderCreator";

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
     * Emits a collection of candles from a local file as if they were sent from a real exchange
     * @param {ICandle[]} candles
     * @returns {Promise<void>} promise
     */
    async emitCandles(candles: ICandle[]) {
        const processedCandles: ICandle[] = [];

        candles.forEach(value => {
            processedCandles.unshift(value);
            (this.orderCreator as LocalOrderCreator).setCurrentCandle(value);
            (this.candleProcessor as LocalCandleProcessor).onProcessCandles(processedCandles);
            this.emit("core.updateCandles", processedCandles);
        });
    }

    isReady(): boolean {
        this.emit("ready");
        return true;
    }

    // Method ignored by localExchange
    onUpdateOrderbook(data: IOrderbookData): void {
        return undefined;
    }

    // Method ignored by localExchange
    subscribeCandles(pair: Pair, interval: ICandleInterval): void {
        return undefined;
    }

    // Method ignored by localExchange
    subscribeOrderbook(pair: Pair): void {
        return undefined;
    }

    // Method ignored by localExchange
    subscribeReports(): void {
        return undefined;
    }

    protected getCandleProcessor(): CandleProcessor {
        return new LocalCandleProcessor(this.orderTracker, this, this.wallet);
    }

    protected getOrderCreator(): OrderCreator {
        return new LocalOrderCreator(this.orderTracker, this.wallet);
    }
}
