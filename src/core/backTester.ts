import CandleLoader, {Parser} from "./candleLoader";
import {IExchange} from "./exchanges/exchangeInterface";
import localExchange from "./exchanges/localExchange";
import LocalExchange from "./exchanges/localExchange";
import SockTrader, {ISockTraderConfig} from "./sockTrader";
import BaseStrategy from "./strategy/baseStrategy";
import {Error} from "tslint/lib/error";

/**
 * The BackTester enables you to test your strategy against a fake dummy exchange
 * and optimize to the point of content
 */
export default class BackTester extends SockTrader {

    private candleLoader?: CandleLoader;

    /**
     * Creates a new BackTester
     * @param {ISockTraderConfig} config
     */
    constructor(config: ISockTraderConfig = {webServer: true}) {
        super(config);

        this.exchange = localExchange.getInstance();
    }

    /**
     * Sets the loader responisble for loading local file data into
     * an in memory candle collection
     * @param {string} path the path to the file containing candles
     * @param {Parser} parser the parser for transforming the data
     * @returns {this}
     */
    setCandleLoader(path: string, parser?: Parser): this {
        this.candleLoader = new CandleLoader(path, parser);

        return this;
    }

    async start(): Promise<void> {
        await super.start();

        if (!this.candleLoader) {
            throw new Error("No candle loader defined.");
        }

        if (!this.eventsBound) {
            this.subscribeToExchangeEvents(this.strategyConfigurations);

            this.strategyConfigurations.forEach(c => {
                const strategy = new c.strategy(c.pair, this.exchange);
                this.bindStrategyToExchange(strategy);
                this.bindExchangeToStrategy(strategy); // @TODO verify
                this.bindExchangeToSocketServer();
                this.bindStrategyToSocketServer(strategy);
            });

            this.eventsBound = true;
        }

        await (this.exchange as LocalExchange).emitCandles(this.candleLoader);
    }

    protected bindExchangeToStrategy(strategy: BaseStrategy): void {
        super.bindExchangeToStrategy(strategy);
    }

    // @TODO this won't work with multiple strategies
    protected bindStrategyToSocketServer(strategy: BaseStrategy) {
        if (!this.webServer) return;

        // @TODO validate if a strategy is a backtest strategy or not??
        this.exchange.on("app.report", (order: any) => {
            console.log("report");
            this.sendToSocketServer("REPORT", order);
        });

        this.exchange.on("app.updateCandles", (candles: any) => {
            // const result = candles.map((r: ICandle) => {
            //     return {
            //         h: r.high,
            //         l: r.low,
            //         c: r.close,
            //         o: r.open,
            //         v: r.volume,
            //         t: r.timestamp.toString(),
            //     };
            // });

            let i;
            let j;
            let temparray: any;
            const chunk = 10;
            for (i = 0, j = candles.length; i < j; i += chunk) {
                temparray = candles.slice(i, i + chunk);
                this.sendToSocketServer("CANDLES", temparray);
                // setImmediate(() => this.sendToSocketServer("CANDLES", temparray));
            }

            // console.log(temparray);
            // throw new Error("qkdzlkjd");
            //
            // temparray.forEach((c: any) => {
            //     console.log(c.length);
            // });
        });

        // @TODO send live/production reports to dashboard
        // strategy.on("app.signal", sendSignal);
        // strategy.on("app.adjustOrder", sendAdjustOrder);
        // strategy.on("backtest.adjustOrder", sendAdjustOrder);
    }
}
