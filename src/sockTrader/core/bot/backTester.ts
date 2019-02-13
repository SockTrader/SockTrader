import moment = require("moment");
import Wallet, {IAssetMap} from "../assets/wallet";
import {ICandle} from "../candles/candleCollection";
import localExchange from "../exchanges/localExchange";
import LocalExchange from "../exchanges/localExchange";
import SockTrader, {ISockTraderConfig} from "./sockTrader";

export interface IBackTestConfig extends ISockTraderConfig {
    assets: IAssetMap;
}

/**
 * The BackTester enables you to test your strategy against a fake dummy exchange
 * and optimize to the point of content
 */
export default class BackTester extends SockTrader {

    /**
     * Creates a new BackTester
     * @param {ISockTraderConfig} config
     * @param candlePath Path to JSON file with candles
     */
    constructor(config: IBackTestConfig, private candlePath: string) {
        super(config);

        const wallet = new Wallet(config.assets);
        this.exchange = localExchange.getInstance(wallet);
    }

    /**
     * Sets the loader responsible for loading local file data into an in memory candle collection
     * @returns {this}
     */
    setCandlePath(candlePath: string): this {
        this.candlePath = candlePath;

        return this;
    }

    async start(): Promise<void> {
        await super.start();

        if (!this.candlePath) {
            throw new Error("No candle loader defined.");
        }

        if (!this.eventsBound) {
            this.subscribeToExchangeEvents(this.strategyConfigurations);

            this.strategyConfigurations.forEach(c => {
                const strategy = new c.strategy(c.pair, this.exchange);
                this.bindStrategyToExchange(strategy);
                this.bindExchangeToStrategy(strategy);
                // this.bindExchangeToSocketServer();
            });

            this.eventsBound = true;
        }

        const candleFile = await import(this.candlePath);
        const candles = this.hydrateCandles(candleFile.payload.candles);

        await (this.exchange as LocalExchange).emitCandles(candles);
    }

    private hydrateCandles(candles: any): ICandle[] {
        return candles.map((c: any) => ({
            ...c,
            timestamp: moment(c.timestamp),
        } as ICandle));
    }

    // private bindExchangeToSocketServer() {
    //     this.exchange.on("app.report", (order: IOrder) => this.sendToWebServer("REPORT", order));
    // }
}
