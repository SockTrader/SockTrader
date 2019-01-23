import {sma as SMA} from "technicalindicators";
import {ICandle} from "../sockTrader/core/candles/candleCollection";
import {IExchange} from "../sockTrader/core/exchanges/exchangeInterface";
import logger from "../sockTrader/core/logger";
import BaseStrategy from "../sockTrader/core/strategy/baseStrategy";
import {crossDown, crossUp} from "../sockTrader/core/strategy/utils";
import {IOrder, OrderStatus} from "../sockTrader/core/types/order";
import {Pair} from "../sockTrader/core/types/pair";

/**
 * Strategy using simple moving average
 * This serves as a demo strategy and is on its own too simplistic
 * for productional use
 */
export default class SimpleMovingAverage extends BaseStrategy {
    private i = 0;

    constructor(pair: Pair, exchange: IExchange) {
        super(pair, exchange);
    }

    notifyOrder(order: IOrder): void {
        if (order.status === OrderStatus.FILLED) {
            console.log("Order:", order.updatedAt.format("YYYY-MM-DD HH:mm"), order.side, order.price);
        }
    }

    updateCandles(candles: ICandle[]): void {
        const closeCandles = candles.map(c => c.close);

        const smaValues =  SMA({
            period : 12,
            values : closeCandles,
        });

        const up = crossUp(smaValues as number[], closeCandles as number[]);
        const down = crossDown(smaValues as number[], closeCandles as number[]);

        if (up) {
            // current simple moving average line crosses price upward => price falls below SMA
            // time to buy!
            logger.info(candles[0].timestamp.format());
            this.buy(this.pair, candles[0].close, 1);
        }

        if (down) {
            // current simple moving average line crosses price downward => prices rises above SMA
            // time to sell!
            this.i++;
            logger.info(candles[0].timestamp.format());
            this.sell(this.pair, candles[0].close, 1);
        }
    }
}
