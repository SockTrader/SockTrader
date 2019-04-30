import uniqBy from "lodash.uniqby";
import uniqWith from "lodash.uniqwith";
import {ICandle, ICandleInterval} from "../candleCollection";
import {IExchange} from "../exchanges/exchangeInterface";
import {IOrderbook} from "../orderbook";
import {IReporter} from "../reporters/reporterInterface";
import BaseStrategy, {IAdjustSignal, ISignal, IStrategyClass} from "../strategy/baseStrategy";
import {IOrder} from "../types/order";
import {Pair} from "../types/pair";

export interface IStrategyConfig {
    interval: ICandleInterval;
    pair: Pair;
    strategy: IStrategyClass<BaseStrategy>;
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
    protected reporters: IReporter[] = [];
    protected strategyConfigurations: IStrategyConfig[] = [];

    /**
     * Adds a reporter
     * @param {IReporter} reporter strategy reporter
     * @returns {this}
     */
    addReporter(reporter: IReporter): this {
        this.reporters.push(reporter);

        return this;
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

    /**
     * Registers the reporters to listen to exhange events:
     * - report: order update
     * @param {IReporter} reporters
     */
    protected bindExchangeToReporters(reporters: IReporter[]): void {
        this.exchange.on("app.report", (order: IOrder) =>
            reporters.forEach(r => r.reportOrder(order)),
        );
    }

    /**
     * Registers the strategies to listen to exchange events:
     * - report: order update
     * - update orderbook: change in orderbook
     * - update candles: change in candles
     * @param {BaseStrategy} strategy
     */
    protected bindExchangeToStrategy(strategy: BaseStrategy): void {
        this.exchange.on("app.report", (order: IOrder) => strategy.notifyOrder(order));
        this.exchange.on("app.updateOrderbook", (orderbook: IOrderbook) => strategy.updateOrderbook(orderbook));
        this.exchange.on("app.updateCandles", (candles: ICandle[]) => strategy.updateCandles(candles));
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
}
