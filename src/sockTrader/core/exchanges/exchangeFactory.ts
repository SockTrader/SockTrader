import OrderTrackerFactory from "../order/orderTrackerFactory";
import WalletFactory from "../plugins/wallet/walletFactory";
import {IOrderFiller} from "../types/IOrderFiller";
import BaseExchange from "./baseExchange";
import LocalOrderFiller from "./orderFillers/localOrderFiller";
import PaperTradingOrderFiller from "./orderFillers/paperTradingOrderFiller";
import RemoteOrderFiller from "./orderFillers/remoteOrderFiller";
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

    private getCandleProcessor(exchange: BaseExchange): IOrderFiller {
        switch (process.env.SOCKTRADER_TRADING_MODE) {
            case "PAPER":
                return new PaperTradingOrderFiller(OrderTrackerFactory.getInstance(), exchange, WalletFactory.getInstance());
            case "LIVE":
                return new RemoteOrderFiller();
            case "BACKTEST":
            default:
                return new LocalOrderFiller(OrderTrackerFactory.getInstance(), exchange, WalletFactory.getInstance());
        }
    }
}
