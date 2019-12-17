import {Exchange} from "../types/exchange";
import SockTrader from "./sockTrader";

/**
 * The LiveTrader enables you to run your strategy against
 * a live environment on an exchange
 */
export default class LiveTrader extends SockTrader {

    /**
     * Sets an exchange
     * @param {Exchange} exchange the exchange to add
     * @returns {this}
     */
    setExchange(exchange: Exchange): this {
        this.exchange = exchange;

        return this;
    }

    async start(): Promise<void> {
        await super.start();

        if (this.eventsBound) return;

        const {strategy: Strategy, pair} = this.strategyConfig;

        this.subscribeToExchangeEvents(this.strategyConfig);
        this.bindEventsToPlugins(this.plugins);

        const strategy = new Strategy(pair, this.exchange);
        this.bindStrategyToExchange(strategy);
        this.bindExchangeToStrategy(strategy);

        this.eventsBound = true;
        this.exchange.connect();
    }
}
