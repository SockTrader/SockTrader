import Events from "../events";
import Orderbook from "../orderbook/orderbook";
import BaseStrategy, {AdjustSignal, IStrategyClass, Signal} from "../strategy/baseStrategy";
import {Candle} from "../types/candle";
import {CandleInterval} from "../types/candleInterval";
import {Exchange} from "../types/exchange";
import {Order} from "../types/order";
import {Pair} from "../types/pair";

export interface StrategyConfig {
    interval?: CandleInterval;
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
    protected plugins: any[] = [];
    protected exchange!: Exchange;
    protected strategyConfig!: StrategyConfig;

    /**
     * Set plugins
     * @param plugin
     * @returns {this}
     */
    setPlugins(plugin: any[]): this {
        this.plugins = plugin;

        return this;
    }

    /**
     * Sets a strategy
     * @param {StrategyConfig} config strategy configuration
     * @returns {this}
     */
    setStrategy(config: StrategyConfig): this {
        this.strategyConfig = config;

        return this;
    }

    /**
     * Starts the application
     * @returns {Promise<void>} promise
     */
    async start(): Promise<void> {
        if (!this.strategyConfig || !this.exchange) {
            throw new Error("SockTrader should have at least 1 strategy and at least 1 exchange.");
        }
    }

    /**
     * Registers the exchange to listen to api events:
     * - new candles for a pair/interval combination found in given configuration
     * - orderbook changes of a pair found in given configuration
     * @param {StrategyConfig} config strategy configuration
     */
    subscribeToExchangeEvents({pair, interval}: StrategyConfig): void {
        const exchange = this.exchange;

        exchange.once("ready", () => {
            exchange.subscribeReports();
            exchange.subscribeOrderbook(pair);
            if (interval) exchange.subscribeCandles(pair, interval);
        });
    }

    /**
     * Initializes all communication between various systems in the trading bot.
     */
    protected initialize() {
        const {strategy: Strategy, pair} = this.strategyConfig;

        this.subscribeToExchangeEvents(this.strategyConfig);

        const strategy = new Strategy(pair, this.exchange);
        this.bindStrategyToExchange(strategy);
        this.bindExchangeToStrategy(strategy);
    }

    /**
     * Registers the strategies to listen to exchange events:
     * - report: order update
     * - update orderbook: change in orderbook
     * - update candles: change in candles
     * @param {BaseStrategy} strategy
     */
    protected bindExchangeToStrategy(strategy: BaseStrategy): void {
        Events.on("core.report", (order: Order) => strategy.notifyOrder(order));
        Events.on("core.snapshotOrderbook", (orderbook: Orderbook) => strategy.updateOrderbook(orderbook));
        Events.on("core.updateOrderbook", (orderbook: Orderbook) => strategy.updateOrderbook(orderbook));
        Events.on("core.snapshotCandles", (candles: Candle[], pair: Pair) => strategy._onSnapshotCandles(candles, pair));
        Events.on("core.updateCandles", (candles: Candle[], pair: Pair) => strategy._onUpdateCandles(candles, pair));
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
        strategy.on("core.signal", ({symbol, price, qty, side}: Signal) => exchange.createOrder(symbol, price, qty, side));
        strategy.on("core.adjustOrder", ({order, price, qty}: AdjustSignal) => exchange.adjustOrder(order, price, qty));
    }
}
