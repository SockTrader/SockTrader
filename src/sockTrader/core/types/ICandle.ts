import {Moment} from "moment";

export interface ICandle {
    close: number;
    high: number;
    low: number;
    open: number;
    timestamp: Moment;
    volume: number;
}
