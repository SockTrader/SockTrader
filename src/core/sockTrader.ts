import {ChildProcess} from "child_process";
import uniqBy from "lodash.uniqby";
import uniqWith from "lodash.uniqwith";
import {Pair} from "../types/pair";
import {ICandle, ICandleInterval} from "./candleCollection";
import {IExchange} from "./exchanges/exchangeInterface";
import {IOrderbook} from "./orderbook";
import {IOrder} from "./orderInterface";
import BaseStrategy, {IAdjustSignal, ISignal, IStrategyClass} from "./strategy/baseStrategy";
import spawnServer from "./web/spawnServer";

export interface IStrategyConfig {
    interval: ICandleInterval;
    pair: Pair;
    strategy: IStrategyClass<BaseStrategy>;
}

export interface ISockTraderConfig {
    webServer?: boolean;
}

/**
 * @class SockTrader
 * @classdesc Main class to start trading with SockTrader
 */
export default abstract class SockTrader {
    protected eventsBound = false;
    protected exchange!: IExchange;
    protected strategyConfigurations: IStrategyConfig[] = [];
    protected webServer?: ChildProcess;

    constructor(protected config: ISockTraderConfig = {webServer: true}) {
        if (this.config.webServer) {
            this.webServer = spawnServer();
            this.webServer.on("START_TRADING", () => this.start());
        }
    }

    addStrategy(config: IStrategyConfig): this {
        this.strategyConfigurations.push(config);

        return this;
    }

    async start(): Promise<void> {
        if (this.strategyConfigurations.length < 1) {
            throw new Error("SockTrader should have at least 1 strategy and at least 1 exchange.");
        }
    }

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

    protected bindExchangeToStrategy(strategy: BaseStrategy): void {
        const exchange = this.exchange;
        exchange.on("app.report", (order: IOrder) => strategy.notifyOrder(order));
        exchange.on("app.updateOrderbook", (orderbook: IOrderbook) => strategy.updateOrderbook(orderbook));
        exchange.on("app.updateCandles", (candles: ICandle[]) => strategy.updateCandles(candles));
    }

    protected bindStrategyToExchange(strategy: BaseStrategy): void {
        const exchange = this.exchange;
        // @TODO add cancel order event!
        strategy.on("app.signal", ({symbol, price, qty, side}: ISignal) => exchange.createOrder(symbol, price, qty, side));
        strategy.on("app.adjustOrder", ({order, price, qty}: IAdjustSignal) => exchange.adjustOrder(order, price, qty));
    }

    protected sendToWebServer(type: string, payload: any) {
        if (this.webServer) this.webServer.send({type, payload});
    }
}
