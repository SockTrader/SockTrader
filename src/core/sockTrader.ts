import {ChildProcess} from "child_process";
import uniqBy from "lodash.uniqby";
import uniqWith from "lodash.uniqwith";
import {ICandleInterval} from "./candleCollection";
import {IExchange} from "./exchanges/exchangeInterface";
import BaseStrategy, {IStrategyClass} from "./strategy/baseStrategy";
import spawnServer from "./web/spawnServer";

interface IStrategyConfig {
    exchange: IExchange;
    interval: ICandleInterval;
    pair: string;
    strategy: IStrategyClass<BaseStrategy>;
}

interface ISockTraderConfig {
    webServer: boolean;
}

/**
 * @class SockTrader
 * @classdesc Main class to start trading with SockTrader
 */
export default class SockTrader {
    private exchanges: IExchange[] = [];
    private socketServer?: ChildProcess;
    private strategyConfigurations: IStrategyConfig[] = [];

    constructor(private config: ISockTraderConfig = {webServer: true}) {
        if (this.config.webServer) {
            this.socketServer = spawnServer();
            this.socketServer.on("START_TRADING", () => this.start());
        }
    }

    addExchange(exchange: IExchange): this {
        this.exchanges.push(exchange);

        return this;
    }

    addStrategy(config: IStrategyConfig): this {
        this.strategyConfigurations.push(config);

        return this;
    }

    async start(): Promise<void> {
        if (this.strategyConfigurations.length < 1 || this.exchanges.length < 1) {
            throw new Error("SockTrader should have at least 1 strategy and at least 1 exchange.");
        }

        this.exchanges.forEach(exchange => {
            const config = this.strategyConfigurations.filter(str => str.exchange === exchange);
            if (config.length <= 0) {
                return; // No strategyConfigurations found for exchange
            }

            const strategies = config.map(c => new c.strategy(c.pair, c.exchange));
            this.bindStrategiesToExchange(exchange, strategies);
            this.bindExchangeToStrategies(exchange, strategies);
            this.bindExchangeToSocketServer(exchange);
            this.bindStrategiesToSocketServer(strategies);
            this.subscribeToExchangeEvents(exchange, strategies, config);
            exchange.connect();
        });
    }

    subscribeToExchangeEvents(exchange: IExchange, strategies: BaseStrategy[], config: IStrategyConfig[]): void {
        exchange.once("ready", () => exchange.subscribeReports());

        // Be sure to only subscribe once to a certain trading pair.
        // Even if multiple strategyConfigurations are listening to the same events.
        // Because we will dispatch the same data to each strategy.
        uniqBy(strategies, "pair")
            .map(({pair}) => exchange.once("ready", () => exchange.subscribeOrderbook(pair)));

        uniqWith(config, (arr, oth) => arr.pair === oth.pair && arr.interval === oth.interval)
            .map(({pair, interval}) => exchange.once("ready", () => exchange.subscribeCandles(pair, interval)));
    }

    private bindExchangeToSocketServer(exchange: IExchange) {
        if (this.socketServer) {
            exchange.on("app.updateCandles", candles => {
                if (this.socketServer) this.socketServer.send({type: "CANDLE_UPDATE", payload: candles});
            });
        }
    }

    private bindExchangeToStrategies(exchange: IExchange, strategies: BaseStrategy[]): void {
        exchange.on("app.report", report => strategies.forEach(strategy => strategy.notifyOrder(report)));
        exchange.on("app.updateOrderbook", orderbook => strategies.forEach(strategy => strategy.updateOrderbook(orderbook)));
        exchange.on("app.updateCandles", candles => strategies.forEach(strategy => strategy.updateCandles(candles)));
    }

    private bindStrategiesToExchange(exchange: IExchange, strategies: BaseStrategy[]): void {
        strategies.forEach(strategy => {
            strategy.on("app.signal", ({symbol, price, qty, side}) => exchange[side](symbol, price, qty));
            strategy.on("app.adjustOrder", ({order, price, qty}) => exchange.adjustOrder(order, price, qty));
        });
    }

    private bindStrategiesToSocketServer(strategies: BaseStrategy[]) {
        if (this.socketServer) {
            strategies.forEach(strategy => {

                /**
                 * @TODO Backtest will block incoming "app.signal" events..
                 */
                strategy.on("app.signal", signal => {
                    // @ts-ignore
                    this.socketServer.send({
                        type: "SIGNAL",
                        payload: signal,
                    });
                });

                // @ts-ignore
                strategy.on("app.adjustOrder", order => this.socketServer.send({
                    type: "ADJUST_ORDER",
                    payload: order,
                }));
            });
        }
    }
}
