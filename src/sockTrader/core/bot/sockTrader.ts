import uniqBy from "lodash.uniqby";
import uniqWith from "lodash.uniqwith";
import {IAssetMap} from "../assets/wallet";
import Events from "../events";
import {IOrderbook} from "../orderbook";
import BaseStrategy, {IAdjustSignal, ISignal, IStrategyClass} from "../strategy/baseStrategy";
import {ICandle} from "../types/ICandle";
import {ICandleInterval} from "../types/ICandleInterval";
import {IExchange} from "../types/IExchange";
import {IOrder} from "../types/order";
import {Pair} from "../types/pair";
import {isAssetAware} from "../types/plugins/IAssetAware";
import {isOrderbookAware} from "../types/plugins/IOrderbookAware";
import {isReportAware} from "../types/plugins/IReportAware";

export interface IStrategyConfig {
    interval?: ICandleInterval;
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
    protected exchange!: IExchange;
    protected strategyConfigurations: IStrategyConfig[] = [];

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
        uniquePairInterval.forEach(({pair, interval}) => exchange.once("ready", () => {
            if (interval) exchange.subscribeCandles(pair, interval);
        }));
    }

    /**
     * Registers plugins to listen to various tradingbot events:
     * @param plugins
     */
    protected bindEventsToPlugins(plugins: any[]): void {
        Events.on("core.report", (order: IOrder) => plugins.forEach(p => {
            if (isReportAware(p)) p.onReport(order);
        }));

        Events.on("core.updateAssets", (assets: IAssetMap, reservedAssets: IAssetMap) => plugins.forEach(p => {
            if (isAssetAware(p)) p.onUpdateAssets(assets, reservedAssets);
        }));

        Events.on("core.updateOrderbook", (orderbook: IOrderbook) => plugins.forEach(p => {
            if (isOrderbookAware(p)) p.onUpdateOrderbook(orderbook);
        }));
    }

    /**
     * Registers the strategies to listen to exchange events:
     * - report: order update
     * - update orderbook: change in orderbook
     * - update candles: change in candles
     * @param {BaseStrategy} strategy
     */
    protected bindExchangeToStrategy(strategy: BaseStrategy): void {
        Events.on("core.report", (order: IOrder) => strategy.notifyOrder(order));
        Events.on("core.snapshotOrderbook", (orderbook: IOrderbook) => strategy.updateOrderbook(orderbook));
        Events.on("core.updateOrderbook", (orderbook: IOrderbook) => strategy.updateOrderbook(orderbook));
        Events.on("core.snapshotCandles", (candles: ICandle[]) => strategy._onSnapshotCandles(candles));
        Events.on("core.updateCandles", (candles: ICandle[]) => strategy._onUpdateCandles(candles));
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
        strategy.on("core.signal", ({symbol, price, qty, side}: ISignal) => exchange.createOrder(symbol, price, qty, side));
        strategy.on("core.adjustOrder", ({order, price, qty}: IAdjustSignal) => exchange.adjustOrder(order, price, qty));
    }
}
