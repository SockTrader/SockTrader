import hitBTC from "./exchanges/hitBTC";
import SockTrader, {ISockTraderConfig} from "./sockTrader";
import BaseStrategy from "./strategy/baseStrategy";

/**
 * @class BackTester
 * @classdesc Main class to start trading with SockTrader
 */
export default class BackTester extends SockTrader {

    constructor(config: ISockTraderConfig = {webServer: true}) {
        super(config);

        // @TODO replace with local exchange!
        this.exchange = hitBTC.getInstance("", "");
    }

    /**
     * @TODO Fix bug: events will be bound again each times you call "start"
     */
    async start(): Promise<void> {
        await super.start();

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

        // @TODO validate if a strategy is a backtest strategy or not??
        strategy.on("backtest.report", (order: any) => {
            console.log("report");
            this.sendToSocketServer("REPORT", order);
        });

        strategy.on("backtest.candles", (candles: any) => {
            // const result = candles.map((r: ICandle) => {
            //     return {
            //         h: r.high,
            //         l: r.low,
            //         c: r.close,
            //         o: r.open,
            //         v: r.volume,
            //         t: r.timestamp.toString(),
            //     };
            // });

            let i;
            let j;
            let temparray: any;
            const chunk = 10;
            for (i = 0, j = candles.length; i < j; i += chunk) {
                temparray = candles.slice(i, i + chunk);
                this.sendToSocketServer("CANDLES", temparray);
                // setImmediate(() => this.sendToSocketServer("CANDLES", temparray));
            }

            // console.log(temparray);
            // throw new Error("qkdzlkjd");
            //
            // temparray.forEach((c: any) => {
            //     console.log(c.length);
            // });
        });

        // @TODO send live/production reports to dashboard
        // strategy.on("app.signal", sendSignal);
        // strategy.on("app.adjustOrder", sendAdjustOrder);
        // strategy.on("backtest.adjustOrder", sendAdjustOrder);
    }

    // private bindExchangeToStrategy(exchange: IExchange, strategies: BaseStrategy[]): void {
    //     exchange.on("app.report", report => strategies.forEach(strategy => strategy.notifyOrder(report)));
    //     exchange.on("app.updateOrderbook", orderbook => strategies.forEach(strategy => strategy.updateOrderbook(orderbook)));
    //     exchange.on("app.updateCandles", candles => strategies.forEach(strategy => strategy.updateCandles(candles)));
    // }
}
