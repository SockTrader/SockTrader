import moment from "moment";
import LocalExchange from "../exchanges/localExchange";
import {IBotStatus} from "../reporters/reporterInterface";
import {ICandle} from "../types/ICandle";
import SockTrader, {IStrategyConfig} from "./sockTrader";

interface IInputCandle {
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

    private readonly inputCandles: IInputCandle[];

    /**
     * Creates a new BackTester
     * @param {IInputCandle} inputCandles
     */
    constructor(inputCandles: IInputCandle[]) {
        super();
        this.inputCandles = inputCandles;
        this.exchange = new LocalExchange();
    }

    async start(): Promise<void> {
        await super.start();

        if (!this.inputCandles || this.inputCandles.length === 0) throw new Error("No candles found as input.");
        if (this.eventsBound) return;

        this.subscribeToExchangeEvents(this.strategyConfigurations);

        this.strategyConfigurations.forEach(c => {
            const strategy = new c.strategy(c.pair, this.exchange);
            this.bindStrategyToExchange(strategy);
            this.bindExchangeToStrategy(strategy);
            this.bindExchangeToReporters(this.reporters);
        });

        const candles = this.hydrateCandles(this.inputCandles);

        this.reportProgress({type: "started", length: candles.length});
        await (this.exchange as LocalExchange).emitCandles(candles);
        this.reportProgress({type: "finished"});

        this.eventsBound = true;
    }

    private hydrateCandles(candles: IInputCandle[]): ICandle[] {
        return candles.map((c: any) => ({
            ...c,
            timestamp: moment(c.timestamp),
        } as ICandle));
    }

    subscribeToExchangeEvents(config: IStrategyConfig[]): void {
        const exchange = this.exchange;
        exchange.once("ready", () => exchange.subscribeReports());
    }

    private reportProgress(status: IBotStatus) {
        this.reporters.forEach(r => r.reportBotProgress(status));
    }
}
