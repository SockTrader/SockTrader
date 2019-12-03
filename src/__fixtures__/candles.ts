import moment from "moment";
import {Candle} from "../sockTrader/core/types/Candle";

export const FX_FILL_CANDLES: Candle[] = [
    {
        open: 100,
        high: 110,
        low: 99,
        close: 102,
        volume: 1000,
        timestamp: moment(),
    },
];

export const FX_NOT_FILL_CANDLES: Candle[] = [
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
