import Local from "../connection/local";
import Events from "../events";
import {ICandle} from "../types/ICandle";
import {ICandleInterval} from "../types/ICandleInterval";
import {IConnection} from "../types/IConnection";
import {IOrderbookData} from "../types/IOrderbookData";
import {Pair} from "../types/pair";
import BaseExchange from "./baseExchange";
import LocalOrderCreator from "./orderCreators/localOrderCreator";
import LocalOrderFiller from "./orderFillers/localOrderFiller";

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

    /**
     * Emits a collection of candles from a local file as if they were sent from a real exchange
     */
    emitCandles(candles: ICandle[]) {
        let processedCandles: ICandle[] = [];

        candles.forEach(value => {
            processedCandles = [value, ...processedCandles];
            (this.orderCreator as LocalOrderCreator).setCurrentCandle(value);
            (this.orderFiller as LocalOrderFiller).onProcessCandles(processedCandles);
            Events.emit("core.updateCandles", processedCandles);
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
}
