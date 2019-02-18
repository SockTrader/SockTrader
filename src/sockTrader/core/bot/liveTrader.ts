import {IExchange} from "../exchanges/exchangeInterface";
import {IOrder} from "../types/order";
import SockTrader from "./sockTrader";

/**
 * The LiveTrader enables you to run your strategy against
 * a live environment on an exchange
 */
export default class LiveTrader extends SockTrader {

    /**
     * Adds an exchange
     * @param {IExchange} exchange the exchange to add
     * @returns {this}
     */
    addExchange(exchange: IExchange): this {
        this.exchange = exchange;

        return this;
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

        // @TODO cannot connect multiple times to the same exchange
        // -> start function might be called multiple times by the dashboard?
        this.exchange.connect();
    }

    // @TODO exchange candles should be forwarded to frontend somehow
    // private bindExchangeToSocketServer() {
    //     this.exchange.on("app.report", (order: IOrder) => this.sendToWebServer("REPORT", order));
    //     this.exchange.on("app.updateCandles", candles => this.sendToWebServer("CANDLE_UPDATE", candles));
    // }
}
