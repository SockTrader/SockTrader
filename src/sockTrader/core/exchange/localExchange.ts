import LocalConnection from "../connection/localConnection";
import {Candle} from "../types/candle";
import {CandleInterval} from "../types/candleInterval";
import {Connection} from "../types/connection";
import {OrderbookData} from "../types/orderbookData";
import {Pair} from "../types/pair";
import BaseExchange from "./baseExchange";
import LocalOrderCreator from "./orderCreators/localOrderCreator";
import LocalOrderFiller from "./orderFillers/localOrderFiller";
import Events from "../events";
import {BotStatus} from "../types/botStatus";

/**
 * The LocalExchange resembles a local dummy marketplace for
 * strategy testing
 */
export default class LocalExchange extends BaseExchange {

    isCurrenciesLoaded = true;
    isAuthenticated = true;
    private chunkSize = 100;

    protected createConnection(): Connection {
        return new LocalConnection();
    }

    protected loadCurrencies(): void {
        return undefined;
    }

    private createGrowingCandleList(candles: Candle[]) {
        let intermediateCandles: Candle[] = [];

        return candles.map((candle, index, array) => {
            intermediateCandles = [candle, ...intermediateCandles];
            return intermediateCandles;
        });
    }

    private createChunks(list: any[], chunkSize: number) {
        const chunkedList: any[][] = [];
        for (let i = 0, j = list.length; i < j; i += chunkSize) {
            chunkedList.push(list.slice(i, i + chunkSize));
        }

        return chunkedList;
    }

    protected prepareCandleChunks(candles: Candle[]): Candle[][][] {
        const growingCandles = this.createGrowingCandleList(candles);

        return this.createChunks(growingCandles, this.chunkSize);
    }

    protected processChunk(chunk: Candle[][], pair: Pair) {
        chunk.forEach(candleList => {
            (this.orderCreator as LocalOrderCreator).setCurrentCandle(candleList[0]);
            (this.orderFiller as LocalOrderFiller).onProcessCandles(candleList);
            Events.emit("core.updateCandles", candleList, pair);
        });
    }

    protected reportProgress(current: number, total: number) {
        Events.emit("core.botStatus", {
            current: current,
            chunks: total,
            type: "progress",
        } as BotStatus);
    }

    /**
     * Emits a collection of candles from a local file as if they were sent from a real exchange.
     * Candles should be ordered during normalization process.
     */
    emitCandles(candles: Candle[], pair: Pair) {
        const candleChunks = this.prepareCandleChunks(candles);
        Events.emit("core.botStatus", {type: "started", chunks: candleChunks.length});

        candleChunks.forEach((chunk, index) => {
            this.reportProgress(index, candleChunks.length);
            this.processChunk(chunk, pair);

            if (index === (candleChunks.length - 1)) {
                Events.emit("core.botStatus", {type: "finished"});
            }
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
