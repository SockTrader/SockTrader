import Events from "../events";
import Orderbook from "../orderbook/orderbook";
import BaseStrategy, {AdjustSignal, IStrategyClass, Signal} from "../strategy/baseStrategy";
import {Candle} from "../types/candle";
import {CandleInterval} from "../types/candleInterval";
import {Exchange} from "../types/exchange";
import {Order} from "../types/order";
import {Pair} from "../types/pair";
import {isAssetAware} from "../types/plugins/assetAware";
import {isCandleAware} from "../types/plugins/candleAware";
import {isOrderbookAware} from "../types/plugins/orderbookAware";
import {isReportAware} from "../types/plugins/reportAware";
import {AssetMap} from "../types/wallet";

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
        this.bindEventsToPlugins(this.plugins);

        const strategy = new Strategy(pair, this.exchange);
        this.bindStrategyToExchange(strategy);
        this.bindExchangeToStrategy(strategy);
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

        Events.on("core.updateCandles", (candles: Candle[]) => plugins.forEach(p => {
            if (isCandleAware(p)) p.onUpdateCandles(candles);
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
