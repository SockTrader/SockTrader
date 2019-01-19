import {IExchange} from "./exchanges/exchangeInterface";
import {IOrder} from "./orderInterface";
import SockTrader from "./sockTrader";

/**
 * @class LiveTrader
 * @classdesc Main class to start trading with SockTrader
 */
export default class LiveTrader extends SockTrader {

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
                this.bindExchangeToSocketServer();
            });

            this.eventsBound = true;
        }

        // @TODO cannot connect multiple times to the same exchange
        // -> start function might be called multiple times by the dashboard?
        this.exchange.connect();
    }

    private bindExchangeToSocketServer() {
        this.exchange.on("app.report", (order: IOrder) => this.sendToWebServer("REPORT", order));
        this.exchange.on("app.updateCandles", candles => this.sendToWebServer("CANDLE_UPDATE", candles));
    }
}
