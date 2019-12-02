import {Pair} from "./pair";

export interface ITradeablePair {
    id: Pair;
    quantityIncrement: number;
    tickSize: number;
}
