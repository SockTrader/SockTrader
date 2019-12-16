import uniqBy from "lodash.uniqby";
import uniqWith from "lodash.uniqwith";
import Events from "../events";
import Orderbook from "../orderbook";
import {AssetMap} from "../plugins/wallet/wallet";
import BaseStrategy, {AdjustSignal, IStrategyClass, Signal} from "../strategy/baseStrategy";
import {Candle} from "../types/candle";
import {CandleInterval} from "../types/candleInterval";
import {Exchange} from "../types/exchange";
import {Order} from "../types/order";
import {Pair} from "../types/pair";
import {isAssetAware} from "../types/plugins/assetAware";
import {isOrderbookAware} from "../types/plugins/orderbookAware";
import {isReportAware} from "../types/plugins/reportAware";

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
    protected strategyConfigurations: StrategyConfig[] = [];

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
     * @param {StrategyConfig} config strategy configuration
     * @returns {this}
     */
    addStrategy(config: StrategyConfig): this {
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
     * @param {StrategyConfig[]} config strategy configuration
     */
    subscribeToExchangeEvents(config: StrategyConfig[]): void {
        const exchange = this.exchange;

        exchange.once("ready", () => exchange.subscribeReports());

        // Be sure to only subscribe once to a certain trading pair.
        // Even if multiple strategyConfigurations are listening to the same events.
        // Because we will dispatch the same data to each strategy.
        const uniquePairs = uniqBy<StrategyConfig>(config, "pair");
        uniquePairs.forEach(({pair}) => exchange.once("ready", () => exchange.subscribeOrderbook(pair)));

        const uniquePairInterval = uniqWith<StrategyConfig>(config, (arr, oth) => arr.pair === oth.pair && arr.interval === oth.interval);
        uniquePairInterval.forEach(({pair, interval}) => exchange.once("ready", () => {
            if (interval) exchange.subscribeCandles(pair, interval);
        }));
    }

    /**
     * Registers plugins to listen to various tradingbot events:
     * @param plugins
     */
    protected bindEventsToPlugins(plugins: any[]): void {
        Events.on("core.report", (order: Order) => plugins.forEach(p => {
            if (isReportAware(p)) p.onReport(order);
        }));

        Events.on("core.updateAssets", (assets: AssetMap, reservedAssets: AssetMap) => plugins.forEach(p => {
            if (isAssetAware(p)) p.onUpdateAssets(assets, reservedAssets);
        }));

        Events.on("core.updateOrderbook", (orderbook: Orderbook) => plugins.forEach(p => {
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
        Events.on("core.report", (order: Order) => strategy.notifyOrder(order));
        Events.on("core.snapshotOrderbook", (orderbook: Orderbook) => strategy.updateOrderbook(orderbook));
        Events.on("core.updateOrderbook", (orderbook: Orderbook) => strategy.updateOrderbook(orderbook));
        Events.on("core.snapshotCandles", (candles: Candle[]) => strategy._onSnapshotCandles(candles));
        Events.on("core.updateCandles", (candles: Candle[]) => strategy._onUpdateCandles(candles));
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
