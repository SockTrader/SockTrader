import uniqBy from "lodash.uniqby";
import uniqWith from "lodash.uniqwith";
import {Pair} from "../types/pair";
import {ICandleInterval} from "./candleCollection";
import {IExchange} from "./exchanges/exchangeInterface";
import BaseStrategy, {IAdjustSignal, ISignal, IStrategyClass} from "./strategy/baseStrategy";
import spawnServer from "./web/spawnServer";
import {Error} from "tslint/lib/error";

export interface IStrategyConfig {
    interval: ICandleInterval;
    pair: Pair;
    strategy: IStrategyClass<BaseStrategy>;
}

export interface ISockTraderConfig {
    webServer?: boolean;
}

/**
 * The SockTrader provides common logic for both:
 * - live trading on an exchange
 * - dummy strategy testing using back testing on
 *   a local exchange
 */
export default abstract class SockTrader {
    protected eventsBound = false;
    protected exchange!: IExchange;
    protected strategyConfigurations: IStrategyConfig[] = [];
    protected webServer?: any;

    constructor(protected config: ISockTraderConfig = { webServer: true }) {
        if (this.config.webServer) {
            this.webServer = spawnServer();
            this.webServer.on("START_TRADING", () => this.start());
        }
    }

    /**
     * Adds a strategy
     * @param {IStrategyConfig} config strategy configuration
     * @returns {this}
     */
    addStrategy(config: IStrategyConfig): this {
        this.strategyConfigurations.push(config);

        return this;
    }

    /**
     * Starts the application
     * @returns {Promise<void>} promise
     */
    async start(): Promise<void> {
        if (this.strategyConfigurations.length < 1) {
            throw new Error("SockTrader should have at least 1 strategy and at least 1 exchange.");
        }
    }

    /**
     * Registers the exchange to listen to api events:
     * - new candles for a pair/interval combination found in given
     *   configuration
     * - orderbook changes of a pair found in given configuration
     * @param {IStrategyConfig[]} config strategy configuration
     */
    subscribeToExchangeEvents(config: IStrategyConfig[]): void {
        const exchange = this.exchange;

        exchange.once("ready", () => exchange.subscribeReports());

        // Be sure to only subscribe once to a certain trading pair.
        // Even if multiple strategyConfigurations are listening to the same events.
        // Because we will dispatch the same data to each strategy.
        const uniquePairs = uniqBy<IStrategyConfig>(config, "pair");
        uniquePairs.forEach(({pair}) => exchange.once("ready", () => exchange.subscribeOrderbook(pair)));

        const uniquePairInterval = uniqWith<IStrategyConfig>(config, (arr, oth) => arr.pair === oth.pair && arr.interval === oth.interval);
        uniquePairInterval.forEach(({pair, interval}) => exchange.once("ready", () => exchange.subscribeCandles(pair, interval)));
    }

    protected bindExchangeToSocketServer() {
        // @TODO send location of parsed file to webServer instead of candle list
        // if (this.webServer) {
        //     exchange.on("app.updateCandles", candles => this.sendToSocketServer("CANDLE_UPDATE", [candles[0]]));
        // }
    }

    // private bindExchangeToSocketServer(exchange: IExchange) {
    //     if (this.webServer) {
    //         exchange.on("app.updateCandles", candles => this.sendToSocketServer("CANDLE_UPDATE", [candles[0]]));
    //     }
    // }

    /**
     * Registers the strategies to listen to exchange events:
     * - report: order update
     * - update orderbook: change in orderbook
     * - update candles: change in candles
     * @param {BaseStrategy} strategy
     */
    protected bindExchangeToStrategy(strategy: BaseStrategy): void {
        const exchange = this.exchange;
        exchange.on("app.report", report => strategy.notifyOrder(report));
        exchange.on("app.updateOrderbook", orderbook => strategy.updateOrderbook(orderbook));
        exchange.on("app.updateCandles", candles => strategy.updateCandles(candles));
    }

    /**
     * Registers the exchange to listen to strategy events:
     * - signal: buy and sells
     * - adjust order: adjustment of existing order
     * @param {BaseStrategy} strategy
     */
    protected bindStrategyToExchange(strategy: BaseStrategy): void {
        const exchange = this.exchange;
        // @TODO add cancel order event!
        strategy.on("app.signal", ({symbol, price, qty, side}: ISignal) => exchange.createOrder(symbol, price, qty, side));
        strategy.on("app.adjustOrder", ({order, price, qty}: IAdjustSignal) => exchange.adjustOrder(order, price, qty));
    }

    protected bindStrategyToSocketServer(strategy: BaseStrategy) {
    // @TODO this won't work with multiple strategies
        if (!this.webServer) return;

        // @TODO send live/production reports to dashboard
        // strategy.on("app.signal", sendSignal);
        // strategy.on("app.adjustOrder", sendAdjustOrder);
        // strategy.on("backtest.adjustOrder", sendAdjustOrder);
    }

    /**
     * Sends messages to webserver
     * @param {string} type type of message
     * @param payload the data
     */
    protected sendToSocketServer(type: string, payload: any) {
        if (this.webServer) this.webServer.broadcast("ipc.message", {type, payload});
    }
}
