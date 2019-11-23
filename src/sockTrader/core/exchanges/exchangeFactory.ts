import OrderTrackerFactory from "../order/orderTrackerFactory";
import WalletFactory from "../plugins/wallet/walletFactory";
import {ICandleProcessor} from "../types/ICandleProcessor";
import BaseExchange from "./baseExchange";
import LocalCandleProcessor from "./candleProcessors/localCandleProcessor";
import PaperTradingCandleProcessor from "./candleProcessors/paperTradingCandleProcessor";
import RemoteCandleProcessor from "./candleProcessors/remoteCandleProcessor";
import {exchanges, IExchangeDefinition} from "./index";
import LocalExchange from "./localExchange";
import LocalOrderCreator from "./orderCreators/localOrderCreator";

export default class ExchangeFactory {

    createExchange(exchangeName?: string): BaseExchange {
        const def = this.getExchangeDefinition(exchangeName);
        const exchange = new def.class();

        // Use LocalOrderCreator in case of: backtest & paper trading

        // @TODO getOrderCreator doesn't work!
        exchange.setOrderCreator(this.getOrderCreator(exchange, def));
        exchange.setCandleProcessor(this.getCandleProcessor(exchange));

        return exchange;
    }

    private getExchangeDefinition(exchangeName?: string): IExchangeDefinition {
        if (exchangeName) {
            const def: IExchangeDefinition = exchanges[exchangeName];
            if (!def) throw new Error(`Could not find exchange: ${exchangeName}`);

            return def;
        }

        return {
            orderCreator: LocalOrderCreator,
            class: LocalExchange,
            intervals: {},
        };
    }

    private getOrderCreator(exchange: BaseExchange, config: IExchangeDefinition) {
        const isLive = process.env.SOCKTRADER_TRADING_MODE === "LIVE";

        const orderCreator = new config.orderCreator();
        return isLive ? orderCreator : new LocalOrderCreator(OrderTrackerFactory.getInstance(), exchange, WalletFactory.getInstance());
    }

    private getCandleProcessor(exchange: BaseExchange): ICandleProcessor {
        switch (process.env.SOCKTRADER_TRADING_MODE) {
            case "PAPER":
                return new PaperTradingCandleProcessor(OrderTrackerFactory.getInstance(), exchange, WalletFactory.getInstance());
            case "LIVE":
                return new RemoteCandleProcessor();
            case "BACKTEST":
            default:
                return new LocalCandleProcessor(OrderTrackerFactory.getInstance(), exchange, WalletFactory.getInstance());
        }
    }
}
