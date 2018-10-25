import uniqBy from "lodash.uniqby";
import uniqWith from "lodash.uniqwith";
import {ICandleInterval} from "./candleCollection";
import {IExchange} from "./exchanges/exchangeInterface";
import Strategy from "./strategy";

interface IStrategyConfiguration {
    exchange: IExchange;
    interval: ICandleInterval;
    pair: string;
    strategy: new (pair: string, exchange: IExchange) => Strategy;
}

/**
 * @class SockTrader
 * @classdesc Main class to start trading with SockTrader
 */
export default class SockTrader {
    private exchanges: IExchange[] = [];
    private strategyConfigurations: IStrategyConfiguration[] = [];

    public addExchange(exchange: IExchange): void {
        this.exchanges.push(exchange);
    }

    public addStrategy(config: IStrategyConfiguration): void {
        this.strategyConfigurations.push(config);
    }

    public start(): void {
        if (this.strategyConfigurations.length < 1 || this.exchanges.length < 1) {
            throw new Error("SockTrader should have at least 1 strategy and at least 1 exchange.");
        }

        this.exchanges.forEach((exchange) => {
            const configList = this.strategyConfigurations.filter((str) => str.exchange === exchange);
            if (configList.length <= 0) {
                return; // No strategyConfigurations found for exchange
            }

            this.initializeStrategies(exchange, configList);
            exchange.connect();
        });
    }

    /**
     * Glue the exchange events to the corresponding strategyConfigurations
     */
    private initializeStrategies(exchange: IExchange, config: IStrategyConfiguration[]): void {
        const strategies = config.map((c) => new c.strategy(c.pair, c.exchange));

        strategies.forEach((strategy) => {
            strategy.on("app.signal", ({symbol, price, qty, side}) => exchange[side](symbol, price, qty));
            strategy.on("app.adjustOrder", ({order, price, qty}) => exchange.adjustOrder(order, price, qty));
        });

        exchange.on("app.report", (report) => strategies.forEach((strategy) => strategy.notifyOrder(report)));
        exchange.on("app.updateOrderbook", (orderbook) => strategies.forEach((strategy) => strategy.updateOrderbook(orderbook)));
        exchange.on("app.updateCandles", (candles) => strategies.forEach((strategy) => strategy.updateCandles(candles)));

        exchange.once("ready", () => exchange.subscribeReports());

        // Be sure to only subscribe once to a certain trading pair.
        // Even if multiple strategyConfigurations are listening to the same events.
        // Because we will dispatch the same data to each strategy.
        uniqBy(strategies, "pair")
            .map(({pair}) => exchange.once("ready", () => exchange.subscribeOrderbook(pair)));

        uniqWith(config, (arr, oth) => arr.pair === oth.pair && arr.interval === oth.interval)
            .map(({pair, interval}) => exchange.once("ready", () => exchange.subscribeCandles(pair, interval)));
    }
}
