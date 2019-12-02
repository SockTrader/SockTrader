import {Pair} from "./pair";

export interface TradeablePair {
    id: Pair;
    quantityIncrement: number;
    tickSize: number;
}
