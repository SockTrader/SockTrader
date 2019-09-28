import {sma as SMA} from "technicalindicators";
import CandleCollection from "../sockTrader/core/candles/candleCollection";
import logger from "../sockTrader/core/logger";
import {IOrderbook} from "../sockTrader/core/orderbook";
import BaseStrategy from "../sockTrader/core/strategy/baseStrategy";
import {crossDown, crossUp} from "../sockTrader/core/strategy/utils";
import {IExchange} from "../sockTrader/core/types/IExchange";
import {IOrder, OrderSide, OrderStatus} from "../sockTrader/core/types/order";
import {Pair} from "../sockTrader/core/types/pair";

/**
 * Simple moving average strategy.
 * -> a buy signal is generated when fast sma crosses the slow sma upwards.
 * -> a sell signal is generated when fast sma crosses the slow sma downwards.
 */
export default class SimpleMovingAverage extends BaseStrategy {

    canBuy = true;
    canSell = false;

    constructor(pair: Pair, exchange: IExchange) {
        super(pair, exchange);
    }

    notifyOrder(order: IOrder): void {
        if (order.status === OrderStatus.FILLED) {
            this.canBuy = order.side === OrderSide.SELL;
            this.canSell = order.side === OrderSide.BUY;
        }

        const {side, quantity, price, status} = order;
        logger.info(`Order: ${JSON.stringify({side, quantity, price, status})}`);
    }

    updateCandles(candles: CandleCollection): void {
        const closeCandles = candles.close;

        const fastSMA = SMA({period: 12, values: closeCandles, reversedInput: true});
        const slowSMA = SMA({period: 24, values: closeCandles, reversedInput: true});

        const up = crossUp(fastSMA, slowSMA);
        const down = crossDown(fastSMA, slowSMA);

        if (up && this.canBuy) {
            this.canBuy = false;
            return this.buy(this.pair, candles[0].close, 1);
        }

        if (down && this.canSell) {
            this.canSell = false;
            return this.sell(this.pair, candles[0].close, 1);
        }
    }

    updateOrderbook(orderBook: IOrderbook): void {
        // Ignore method
    }
}
