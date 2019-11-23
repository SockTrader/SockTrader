import {ICandleInterval} from "../types/ICandleInterval";
import {IOrderCreator} from "../types/IOrderCreator";
import BaseExchange from "./baseExchange";
import HitBTC, {CandleInterval} from "./hitBTC";
import HitBTCOrderCreator from "./orderCreators/hitBTCOrderCreator";

export interface IExchangeDefinition {
    class: new() => BaseExchange;
    orderCreator: new(...args: any[]) => IOrderCreator;
    intervals: Record<string, ICandleInterval>;
}

export const exchanges: Record<string, IExchangeDefinition> = {
    hitbtc: {
        class: HitBTC,
        orderCreator: HitBTCOrderCreator,
        intervals: {
            "1m": CandleInterval.ONE_MINUTE,
            "3m": CandleInterval.THREE_MINUTES,
            "5m": CandleInterval.FIVE_MINUTES,
            "15m": CandleInterval.FIFTEEN_MINUTES,
            "30m": CandleInterval.THIRTY_MINUTES,
            "1h": CandleInterval.ONE_HOUR,
            "4h": CandleInterval.FOUR_HOURS,
            "1d": CandleInterval.ONE_DAY,
            "7d": CandleInterval.SEVEN_DAYS,
            "1M": CandleInterval.ONE_MONTH,
        },
    },
};
