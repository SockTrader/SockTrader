import CandleCollection from "../sockTrader/core/candle/candleCollection";
import Orderbook from "../sockTrader/core/orderbook/orderbook";
import BaseStrategy from "../sockTrader/core/strategy/baseStrategy";
import {Exchange} from "../sockTrader/core/types/exchange";
import {Order} from "../sockTrader/core/types/order";
import {Pair} from "../sockTrader/core/types/pair";

/**
 * Empty strategy. This strategy does nothing.
 * Could be useful if you want to use some of the plugins in SockTrader to log exchange data.
 */
export default class Empty extends BaseStrategy {

    constructor(pair: Pair, exchange: Exchange) {
        super(pair, exchange);
    }

    notifyOrder(order: Order): void {
        // Ignore
    }

    updateCandles(candles: CandleCollection): void {
        // Ignore method
    }

    updateOrderbook(orderBook: Orderbook): void {
        // Ignore method
    }
}
