import OrderTrackerFactory from "../order/orderTrackerFactory";
import WalletFactory from "../plugins/wallet/walletFactory";
import {OrderFiller} from "../types/orderFiller";
import BaseExchange from "./baseExchange";
import {ExchangeDefinition, exchanges} from "./index";
import LocalExchange from "./localExchange";
import LocalOrderCreator from "./orderCreators/localOrderCreator";
import LocalOrderFiller from "./orderFillers/localOrderFiller";
import PaperTradingOrderFiller from "./orderFillers/paperTradingOrderFiller";
import RemoteOrderFiller from "./orderFillers/remoteOrderFiller";

export default class ExchangeFactory {

    createExchange(exchangeName?: string): BaseExchange {
        const def = this.getExchangeDefinition(exchangeName);
        const exchange = new def.class();

        // Use LocalOrderCreator in case of: backtest & paper trading

        // @TODO getOrderCreator doesn't work!
        exchange.setOrderCreator(this.getOrderCreator(def));
        exchange.setOrderFiller(this.getOrderFiller());

        return exchange;
    }

    private getExchangeDefinition(exchangeName?: string): ExchangeDefinition {
        if (exchangeName) {
            const def: ExchangeDefinition = exchanges[exchangeName];
            if (!def) throw new Error(`Could not find exchange: ${exchangeName}`);

            return def;
        }

        return {
            orderCreator: LocalOrderCreator,
            class: LocalExchange,
            intervals: {},
        };
    }

    private getOrderCreator(config: ExchangeDefinition) {
        const isLive = process.env.SOCKTRADER_TRADING_MODE === "LIVE";

        const orderCreator = new config.orderCreator();
        return isLive ? orderCreator : new LocalOrderCreator(OrderTrackerFactory.getInstance(), WalletFactory.getInstance());
    }

    private getOrderFiller(): OrderFiller {
        switch (process.env.SOCKTRADER_TRADING_MODE) {
            case "PAPER":
                return new PaperTradingOrderFiller(OrderTrackerFactory.getInstance(), WalletFactory.getInstance());
            case "LIVE":
                return new RemoteOrderFiller();
            case "BACKTEST":
            default:
                return new LocalOrderFiller(OrderTrackerFactory.getInstance(), WalletFactory.getInstance());
        }
    }
}
