import {IExchange} from "./exchanges/exchangeInterface";
import SockTrader from "./sockTrader";
import BaseStrategy from "./strategy/baseStrategy";

/**
 * @class LiveTrader
 * @classdesc Main class to start trading with SockTrader
 */
export default class LiveTrader extends SockTrader {

    addExchange(exchange: IExchange): this {
        this.exchange = exchange;

        return this;
    }

    /**
     * @TODO Fix bug: events will be bound again each times you call "start"
     */
    async start(): Promise<void> {
        await super.start();

        if (!this.exchange) {
            throw new Error("No exchange defined!");
        }

        this.subscribeToExchangeEvents(this.strategyConfigurations);

        this.strategyConfigurations.forEach(c => {
            const strategy = new c.strategy(c.pair, this.exchange);
            this.bindStrategyToExchange(strategy);
            this.bindExchangeToStrategy(strategy); // @TODO verify
            this.bindExchangeToSocketServer();
            this.bindStrategyToSocketServer(strategy);
            this.exchange.connect();
        });
    }

    // @TODO this won't work with multiple strategies
    protected bindStrategyToSocketServer(strategy: BaseStrategy) {
        if (!this.webServer) return;

        // @TODO send live/production reports to dashboard
        // strategy.on("app.signal", sendSignal);
        // strategy.on("app.adjustOrder", sendAdjustOrder);
        // strategy.on("backtest.adjustOrder", sendAdjustOrder);
    }
}
