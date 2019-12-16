import moment from "moment";
import {Candle} from "../sockTrader/core/types/candle";

export const FX_CANDLE_1: Candle[] = [
    {
        open: 100,
        high: 110,
        low: 99,
        close: 102,
        volume: 1000,
        timestamp: moment(),
    },
];

export const FX_CANDLE_2: Candle[] = [
    {
        open: 100,
        high: 110,
        low: 100,
        close: 102,
        volume: 1000,
        timestamp: moment(),
    },
];

export const FX_HISTORICAL_CANDLES: Candle[] = [
    {
        open: 100,
        high: 110,
        low: 99,
        close: 102,
        volume: 1000,
        timestamp: moment().subtract(1, "day"),
    },
];

export const FX_CANDLE_LIST: Candle[] = [
    ...FX_CANDLE_2,
    ...FX_HISTORICAL_CANDLES,
    ...FX_CANDLE_1,
];
