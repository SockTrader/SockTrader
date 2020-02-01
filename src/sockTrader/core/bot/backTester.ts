import moment from "moment";
import Events from "../events";
import ExchangeFactory from "../exchange/exchangeFactory";
import LocalExchange from "../exchange/localExchange";
import {Candle} from "../types/candle";
import SockTrader from "./sockTrader";

interface InputCandle {
    close: number;
    high: number;
    low: number;
    open: number;
    timestamp: string;
    volume: number;
}

/**
 * The BackTester enables you to test your strategy against a fake dummy exchange
 * and optimize to the point of content
 */
export default class BackTester extends SockTrader {

    private readonly inputCandles: InputCandle[];

    /**
     * Creates a new BackTester
     * @param {InputCandle} inputCandles
     */
    constructor(inputCandles: InputCandle[]) {
        super();
        this.inputCandles = inputCandles;
        this.exchange = new ExchangeFactory().createExchange("local");
    }

    async start(): Promise<void> {
        await super.start();

        if (!this.inputCandles || this.inputCandles.length === 0) throw new Error("No candles found as input.");
        if (this.eventsBound) return;

        this.initialize();
        const candles = this.hydrateCandles(this.inputCandles);

        Events.emit("core.botStatus", {type: "started", length: candles.length});
        await (this.exchange as LocalExchange).emitCandles(candles);
        Events.emit("core.botStatus", {type: "finished"});

        this.eventsBound = true;
    }

    private hydrateCandles(candles: InputCandle[]): Candle[] {
        return candles.map((c: any) => ({
            ...c,
            timestamp: moment(c.timestamp),
        } as Candle));
    }
}
