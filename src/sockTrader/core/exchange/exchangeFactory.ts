import config from "../../../config";
import OrderTracker from "../order/orderTracker";
import {OrderFiller} from "../types/orderFiller";
import Wallet from "../wallet/wallet";
import BaseExchange from "./baseExchange";
import {ExchangeDefinition, exchanges} from "./index";
import LocalOrderCreator from "./orderCreators/localOrderCreator";
import LocalOrderFiller from "./orderFillers/localOrderFiller";
import PaperTradingOrderFiller from "./orderFillers/paperTradingOrderFiller";
import RemoteOrderFiller from "./orderFillers/remoteOrderFiller";

export default class ExchangeFactory {

    createExchange(exchangeName: string): BaseExchange {
        const def = this.getExchangeDefinition(exchangeName);

        const exchange = new def.class();
        const wallet = new Wallet(config.assets);
        const orderTracker = new OrderTracker();

        const orderCreator = this.getOrderCreator(def, wallet, orderTracker);
        const orderFiller = this.getOrderFiller(wallet, orderTracker);

        exchange.setOrderCreator(orderCreator);
        exchange.setOrderFiller(orderFiller);
        exchange.setOrderTracker(orderTracker);
        exchange.setWallet(wallet);

        return exchange;
    }

    private getExchangeDefinition(exchangeName: string): ExchangeDefinition {
        const def: ExchangeDefinition = exchanges[exchangeName];
        if (!def) throw new Error(`Could not find exchange: ${exchangeName}`);

        return def;
    }

    /**
     * In case of backtest & paper trading, return LocalOrderCreator
     * In case of live trading, get order creator for given exchange
     * @param definition
     * @param wallet
     * @param orderTracker
     */
    private getOrderCreator(definition: ExchangeDefinition, wallet: Wallet, orderTracker: OrderTracker) {
        const isLive = process.env.SOCKTRADER_TRADING_MODE === "LIVE";

        return isLive
            ? new definition.orderCreator()
            : new LocalOrderCreator(orderTracker, wallet);
    }

    private getOrderFiller(wallet: Wallet, orderTracker: OrderTracker): OrderFiller {
        switch (process.env.SOCKTRADER_TRADING_MODE) {
            case "PAPER":
                return new PaperTradingOrderFiller(orderTracker, wallet);
            case "LIVE":
                return new RemoteOrderFiller();
            case "BACKTEST":
            default:
                return new LocalOrderFiller(orderTracker, wallet);
        }
    }
}
