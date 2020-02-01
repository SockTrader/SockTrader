import {Moment} from "moment";
import {Pair} from "./pair";

export interface Candle {
    close: number;
    high: number;
    low: number;
    open: number;
    timestamp: Moment;
    volume: number;
}

export interface InputCandle {
    close: number;
    high: number;
    low: number;
    open: number;
    timestamp: string;
    volume: number;
}

export interface CandleFile {
    name: string;
    candles: InputCandle[];
    symbol: Pair;
    volumeDecimals: number;
    priceDecimals: number;
    candleInterval: number;
}
