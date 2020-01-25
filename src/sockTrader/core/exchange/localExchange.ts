import LocalConnection from "../connection/localConnection";
import Events from "../events";
import {Candle} from "../types/candle";
import {CandleInterval} from "../types/candleInterval";
import {Connection} from "../types/connection";
import {OrderbookData} from "../types/orderbookData";
import {Pair} from "../types/pair";
import BaseExchange from "./baseExchange";
import LocalOrderCreator from "./orderCreators/localOrderCreator";
import LocalOrderFiller from "./orderFillers/localOrderFiller";

/**
 * The LocalExchange resembles a local dummy marketplace for
 * strategy testing
 */
export default class LocalExchange extends BaseExchange {

    isCurrenciesLoaded = true;
    isAuthenticated = true;

    protected createConnection(): Connection {
        return new LocalConnection();
    }

    protected loadCurrencies(): void {
        return undefined;
    }

    /**
     * Emits a collection of candles from a local file as if they were sent from a real exchange.
     * Candles should be ordered during normalization process.
     */
    emitCandles(candles: Candle[]) {
        let processedCandles: Candle[] = [];

        candles.forEach(value => {
            processedCandles = [value, ...processedCandles];
            (this.orderCreator as LocalOrderCreator).setCurrentCandle(value);
            (this.orderFiller as LocalOrderFiller).onProcessCandles(processedCandles);
            Events.emit("core.updateCandles", processedCandles);
        });
    }

    // Method ignored by localExchange
    onUpdateOrderbook(data: OrderbookData): void {
        return undefined;
    }

    // Method ignored by localExchange
    subscribeCandles(pair: Pair, interval: CandleInterval): void {
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
