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

export const FX_FIXED_CANDLES: Candle[] = [
    {
        open: 105,
        high: 110,
        low: 95,
        close: 105,
        volume: 1000,
        timestamp: moment("2020-01-01 19:00:00+01:00"),
    },
    {
        open: 101,
        high: 110,
        low: 101,
        close: 105,
        volume: 1000,
        timestamp: moment("2020-01-01 18:00:00+01:00"),
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
