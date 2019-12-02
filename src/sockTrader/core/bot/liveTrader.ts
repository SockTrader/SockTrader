import {Exchange} from "../types/Exchange";
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

        if (!this.exchange) throw new Error("No exchange defined!");
        if (this.eventsBound) return;

        this.subscribeToExchangeEvents(this.strategyConfigurations);
        this.bindEventsToPlugins(this.plugins);

        this.strategyConfigurations.forEach(c => {
            const strategy = new c.strategy(c.pair, this.exchange);
            this.bindStrategyToExchange(strategy);
            this.bindExchangeToStrategy(strategy);
        });

        this.eventsBound = true;
        this.exchange.connect();
    }
}
