import moment from "moment";
import Wallet, {IAssetMap} from "../assets/wallet";
import LocalExchange from "../exchanges/localExchange";
import {IBotStatus} from "../reporters/reporterInterface";
import {ICandle} from "../types/ICandle";
import SockTrader from "./sockTrader";

export interface IBackTestConfig {
    assets: IAssetMap;
}

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
     * @param {IBackTestConfig} config
     * @param {IInputCandle} inputCandles
     */
    constructor(config: IBackTestConfig, inputCandles: IInputCandle[]) {
        super();
        this.inputCandles = inputCandles;

        const wallet = new Wallet(config.assets);
        this.exchange = LocalExchange.getInstance(wallet);
    }

    async start(): Promise<void> {
        await super.start();

        if (!this.inputCandles || this.inputCandles.length === 0) {
            throw new Error("No candles found as input.");
        }

        if (!this.eventsBound) {
            this.subscribeToExchangeEvents(this.strategyConfigurations);

            this.strategyConfigurations.forEach(c => {
                const strategy = new c.strategy(c.pair, this.exchange);
                this.bindStrategyToExchange(strategy);
                this.bindExchangeToStrategy(strategy);
                this.bindExchangeToReporters(this.reporters);
            });

            this.eventsBound = true;
        }

        const candles = this.hydrateCandles(this.inputCandles);

        this.reportProgress({type: "started", length: candles.length});
        await (this.exchange as LocalExchange).emitCandles(candles);
        this.reportProgress({type: "finished"});
    }

    private hydrateCandles(candles: IInputCandle[]): ICandle[] {
        return candles.map((c: any) => ({
            ...c,
            timestamp: moment(c.timestamp),
        } as ICandle));
    }

    private reportProgress(status: IBotStatus) {
        this.reporters.forEach(r => r.reportBotProgress(status));
    }
}
