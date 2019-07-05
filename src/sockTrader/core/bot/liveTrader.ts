import {IExchange} from "../exchanges/exchangeInterface";
import logger from "../logger";
import BaseStrategy, {IAdjustSignal, ISignal} from "../strategy/baseStrategy";
import SockTrader from "./sockTrader";

/**
 * The LiveTrader enables you to run your strategy against
 * a live environment on an exchange
 */
export default class LiveTrader extends SockTrader {

    constructor(private paperTrading = false) {
        super();
    }

    /**
     * Adds an exchange
     * @param {IExchange} exchange the exchange to add
     * @returns {this}
     */
    addExchange(exchange: IExchange): this {
        this.exchange = exchange;

        return this;
    }

    protected bindStrategyToExchange(strategy: BaseStrategy): void {
        if (!this.paperTrading) return super.bindStrategyToExchange(strategy);

        strategy.on("app.adjustOrder", (adjustSignal: IAdjustSignal) => logger.info(`[PT] ADJUST: ${adjustSignal}`));
        strategy.on("app.signal", (signal: ISignal) => logger.info(`[PT] ORDER: ${signal}`));
    }

    async start(): Promise<void> {
        await super.start();

        if (!this.exchange) {
            throw new Error("No exchange defined!");
        }

        if (!this.eventsBound) {
            this.subscribeToExchangeEvents(this.strategyConfigurations);

            this.strategyConfigurations.forEach(c => {
                const strategy = new c.strategy(c.pair, this.exchange);
                this.bindStrategyToExchange(strategy);
                this.bindExchangeToStrategy(strategy);
                this.bindExchangeToReporters(this.reporters);
            });

            this.eventsBound = true;
        }

        this.exchange.connect();
    }
}
